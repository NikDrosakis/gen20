// services/user_service.go
package misc

import "github.com/gin-gonic/gin"

// User represents a simple user model
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

// GetUsers returns a list of users
func GetUsers(c *gin.Context) {
    users := []User{
        {ID: 1, Name: "Alice"},
        {ID: 2, Name: "Bob"},
    }
    c.JSON(200, users)
}
