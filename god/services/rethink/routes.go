package rethink

import (
	"fmt"
	"log"
	"net/http"
	"github.com/dancannon/gorethink"
	"github.com/gin-gonic/gin"
)
// Struct for handling curriculum data
type Curriculum struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Level string `json:"level"`
	// Add more fields as per your `curriculum` table structure
}

var session *gorethink.Session

func init() {
	// Connect to RethinkDB instance
	var err error
	session, err = gorethink.Connect(gorethink.ConnectOpts{
		Address:  "vivalibro.com:28015", // RethinkDB server address
		Database: "gen20",             // Database name
		AuthKey:  "n130177!",                  // If you have authentication set up, provide it
	})

	if err != nil {
		log.Fatalf("Failed to connect to RethinkDB: %v", err)
	}
}

// InsertRethink inserts a new chat message into the RethinkDB table
func InsertRethink(c *gin.Context) {
    table := c.Param("table") // Get table name from URL

    var chatMsg map[string]interface{}
    if err := c.ShouldBindJSON(&chatMsg); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
        return
    }

    res, err := gorethink.Table(table).Insert(chatMsg).RunWrite(session)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert failed", "details": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "success", "inserted": res.Inserted})
}

func pushRethink(c *gin.Context) {
    table := c.Param("table") // Get table name from URL

    var chatMsg map[string]interface{}
    if err := c.ShouldBindJSON(&chatMsg); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
        return
    }

    cid, exists := chatMsg["cid"].(string)
    if !exists || cid == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid 'cid'"})
        return
    }

    // Extract only {t, m, u} fields
    chatData := map[string]interface{}{
        "t": chatMsg["t"],
        "m": chatMsg["m"],
        "u": chatMsg["u"],
    }

    // Update existing row by pushing {t, m, u} to the chat array
    res, err := gorethink.Table(table).
        Filter(gorethink.Row.Field("cid").Eq(cid)).
        Update(map[string]interface{}{
            "chat": gorethink.Row.Field("chat").Default([]interface{}{}).Append(chatData),
        }).RunWrite(session)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed", "details": err.Error()})
        return
    }

    if res.Replaced == 0 && res.Updated == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "No chat found for cid", "cid": cid})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "success", "updated": res.Replaced + res.Updated})
}

func GetRethinkRow(c *gin.Context) {
    table := c.Param("table") // Get table name from URL
    id := c.DefaultQuery("id", "")   // Get "id" from query parameters
    cid := c.DefaultQuery("cid", "") // Get "cid" from query parameters

    var cursor *gorethink.Cursor
    var err error

    query := gorethink.Table(table)

    if id != "" {
        query = query.Filter(gorethink.Row.Field("id").Eq(id))
    }
    if cid != "" {
        query = query.Filter(gorethink.Row.Field("cid").Eq(cid))
    }

    cursor, err = query.Run(session)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to query table %s: %v", table, err),
        })
        return
    }
    defer cursor.Close()

    var results []map[string]interface{}
    err = cursor.All(&results)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to parse data from table %s: %v", table, err),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": results})
}

/*
// UpdateRethink updates an existing record in the specified table and row
func UpdateRethink(c *gin.Context) {
    table := c.Param("table") // Get table name from URL

    // Parse the JSON body into a map (the data to update)
    var data map[string]interface{}
    if err := c.BindJSON(&data); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("Failed to parse data: %v", err),
        })
        return
    }

    row := c.Param("row") // You can also pass the row in the URL or body

    // Call rethink.UpdateRethink with the parsed data
    result, err := rethink.UpdateRethink(table, row, data)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to update data: %v", err),
        })
        return
    }

    // Return the result as a JSON response
    c.JSON(http.StatusOK, gin.H{
        "data": result,
    })
}

// DeleteRethink deletes a record from the specified table and row
func DeleteRethink(c *gin.Context) {
    table := c.Param("table") // Get table name from URL
    row := c.Param("row")     // Get row name from URL (or you can pass it in the request body)

    // Call rethink.DeleteRethink with the table and row
    result, err := rethink.DeleteRethink(table, row)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to delete data: %v", err),
        })
        return
    }

    // Return the result as a JSON response
    c.JSON(http.StatusOK, gin.H{
        "data": result,
    })
}
*/