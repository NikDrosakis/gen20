package rethink

import (
"fmt"
"log"
	"github.com/gin-gonic/gin"
	"github.com/dancannon/gorethink"
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

// GetRethinkRow handles the /rethink/:table/:row route
func GetRethinkRow(c *gin.Context) {
    table := c.Param("table") // Get table name from URL
    name := c.Param("row")    // Get name (e.g., 'about') from URL

    // Query the specific table by the indexed 'name' field using the correct syntax
    var result interface{}
    cursor, err := gorethink.Table(table).Filter(gorethink.Row.Field("name").Eq(name)).Run(session)
    if err != nil {
        c.JSON(500, gin.H{
            "error": fmt.Sprintf("Failed to query table %s: %v", table, err),
        })
        return
    }
    defer cursor.Close()

    // Parse the result
    err = cursor.One(&result)
    if err != nil {
        c.JSON(500, gin.H{
            "error": fmt.Sprintf("Failed to parse data from table %s: %v", table, err),
        })
        return
    }

    // Return the result as JSON
    c.JSON(200, gin.H{
        "data": result,
    })
}
