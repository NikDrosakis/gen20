package mermaid

import (
    "github.com/gin-gonic/gin"
    "io/ioutil"
    "net/http"
    "os"
    "path/filepath"
)

func RegisterRoutes(router *gin.Engine) {
    mermaid := router.Group("/mermaid")
    {
        mermaid.POST("/generate", generateDiagram)
    }
}

func generateDiagram(c *gin.Context) {
    // Read JSON input from the request body
    var jsonData map[string]interface{}
    if err := c.BindJSON(&jsonData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
        return
    }

    // Extract relevant data for Mermaid.js (this depends on your specific JSON structure)
    diagramData, ok := jsonData["diagram"].(string)
    if !ok {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Diagram data not found"})
        return
    }

    // Define the output file path
    outputDir := "./diagrams"
    outputFile := filepath.Join(outputDir, "diagram.mmd")

    // Create the directory if it doesn't exist
    if _, err := os.Stat(outputDir); os.IsNotExist(err) {
        if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create output directory"})
            return
        }
    }

    // Write the Mermaid.js diagram data to the file
    if err := ioutil.WriteFile(outputFile, []byte(diagramData), 0644); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write diagram file"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Diagram generated successfully", "file": outputFile})
}
