package core

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
    table := c.Param("table")
    name := c.Param("name") // Extract name from the route path

    fmt.Println("DEBUG: Received table:", table)
    fmt.Println("DEBUG: Received name:", name)

    var query gorethink.Term
    if name != "" {
        fmt.Println("DEBUG: Applying filter for name:", name)
        query = gorethink.Table(table).Filter(gorethink.Row.Field("name").Eq(name))
    } else {
        fmt.Println("DEBUG: No filter applied, returning all data.")
        query = gorethink.Table(table)
    }

    fmt.Println("DEBUG: Generated query:", query)

    cursor, err := query.Run(session)
    if err != nil {
        fmt.Println("DEBUG: Query execution error:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to query table %s: %v", table, err),
        })
        return
    }
    defer cursor.Close()

    var results []map[string]interface{}
    err = cursor.All(&results)
    if err != nil {
        fmt.Println("DEBUG: Error parsing query results:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to parse data from table %s: %v", table, err),
        })
        return
    }

    fmt.Println("DEBUG: Query results:", results)
    c.JSON(http.StatusOK, gin.H{"data": results})
}


func UpdateRethink(c *gin.Context) {
    table := c.Param("table")
    name := c.Param("name")

    fmt.Println("DEBUG: Updating entry in table:", table)
    fmt.Println("DEBUG: Target entry with name:", name)

    var updateData map[string]interface{}
    if err := c.ShouldBindJSON(&updateData); err != nil {
        fmt.Println("DEBUG: Error parsing JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
        return
    }

    res, err := gorethink.Table(table).
        Filter(gorethink.Row.Field("name").Eq(name)).
        Update(updateData).
        RunWrite(session)

    if err != nil {
        fmt.Println("DEBUG: Error updating data:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update table %s: %v", table, err)})
        return
    }

    fmt.Println("DEBUG: Update result:", res)
    c.JSON(http.StatusOK, gin.H{"message": "Update successful", "updated": res.Updated})
}


func DeleteRethink(c *gin.Context) {
    table := c.Param("table")
    name := c.Param("name")

    fmt.Println("DEBUG: Deleting entry from table:", table)
    fmt.Println("DEBUG: Target entry with name:", name)

    res, err := gorethink.Table(table).
        Filter(gorethink.Row.Field("name").Eq(name)).
        Delete().
        RunWrite(session)

    if err != nil {
        fmt.Println("DEBUG: Error deleting data:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete from table %s: %v", table, err)})
        return
    }

    fmt.Println("DEBUG: Delete result:", res)
    c.JSON(http.StatusOK, gin.H{"message": "Delete successful", "deleted": res.Deleted})
}
