// services/product_service.go
package misc

import "github.com/gin-gonic/gin"

// Product represents a simple product model
type Product struct {
    ID   int     `json:"id"`
    Name string  `json:"name"`
    Price float64 `json:"price"`
}

// GetProducts returns a list of products
func GetProducts(c *gin.Context) {
    products := []Product{
        {ID: 1, Name: "Gadget", Price: 99.99},
        {ID: 2, Name: "Widget", Price: 49.99},
    }
    c.JSON(200, products)
}
