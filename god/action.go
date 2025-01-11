/*
 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
 This go part integrate this process into Microservices
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization
GitHub Actions CI/CD workflow
Trigger: The workflow runs when changes are pushed to the main branch
or when a pull request is made to the main branch.
write PHP scripts for your database actions (action, actiongrp) that run when triggered during your CI/CD pipeline.
- name: Run database schema migration
  run: |
    php db-schema-action.php --action migrate
    <?php
    // db-schema-action.php
    if ($argv[1] === 'migrate') {
        // Call migration logic (e.g., using PDO for MySQL database)
        echo "Migrating database schema...\n";
    }
- name: Deploy to server
  run: |
    ssh user@yourserver.com "bash -s" < ./deploy.sh
    ?>
*/
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// Constants
const (
	DEPRECATED           = 0
	DANGEROUS            = 1
	MISSING_INFRASTRUCTURE = 2
	NEEDS_UPDATES        = 3
	INACTIVE_WRONG_FAILED = 4
	NEW                  = 5
	WORKING_TESTING_EXPERIMENTAL = 6
	ALPHA_RUNNING_READY  = 7
	BETA_WORKING         = 8
	STABLE               = 9
	STABLE_DEPENDS_OTHERS = 10
)

// Global Variables
var (
	executionRunning bool
	mu               sync.Mutex
	db               *sql.DB
	root             string
)

// Config struct for database
type Config struct {
	DBHost     string `json:"db_host"`
	DBUser     string `json:"db_user"`
	DBPassword string `json:"db_password"`
	DBName     string `json:"db_name"`
}

// ActionGrpData struct
type ActionGrpData struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Base        string      `json:"base"`
	Meta        interface{} `json:"meta"`
}

// ActionData struct
type ActionData struct {
	Name        string      `json:"name"`
	Systemsid   int         `json:"systemsid"`
	Endpoint    string      `json:"endpoint"`
	Payload     string      `json:"payload"`
	Body        interface{} `json:"body"`
	Requires    string      `json:"requires"`
	IntervalTime int         `json:"interval_time"`
	Sort        int         `json:"sort"`
	Type        string      `json:"type"`
	Keys        string      `json:"keys"`
	Statement   string      `json:"statement"`
	Execute     string      `json:"execute"`
}

// ActionRecord struct
type ActionRecord struct {
	ID          int         `json:"id"`
	Name        string      `json:"name"`
	Actiongrpid int         `json:"actiongrpid"`
	Systemsid   int         `json:"systemsid"`
	Endpoint    string      `json:"endpoint"`
	Status      int         `json:"status"`
	Log         string      `json:"log"`
	Updated     time.Time   `json:"updated"`
	ExeTime     int         `json:"exe_time"`
	Keys        string      `json:"keys"`
	Payload     string      `json:"payload"`
	Body        interface{} `json:"body"`
	Requires    string      `json:"requires"`
	IntervalTime int         `json:"interval_time"`
	Sort        int         `json:"sort"`
	Type        string      `json:"type"`
	GrpName     string      `json:"grpName"`
	Base        string      `json:"base"`
}

// ActionResponse struct
type ActionResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    *ActionRecord `json:"data"`
}

// StatusCounts struct
type StatusCounts struct {
	DEPRECATED           int `json:"DEPRECATED"`
	DANGEROUS            int `json:"DANGEROUS"`
	MISSING_INFRASTRUCTURE int `json:"MISSING_INFRASTRUCTURE"`
	NEEDS_UPDATES        int `json:"NEEDS_UPDATES"`
	INACTIVE_WRONG_FAILED int `json:"INACTIVE_WRONG_FAILED"`
	NEW                  int `json:"NEW"`
	WORKING_TESTING_EXPERIMENTAL int `json:"WORKING_TESTING_EXPERIMENTAL"`
	ALPHA_RUNNING_READY  int `json:"ALPHA_RUNNING_READY"`
	BETA_WORKING         int `json:"BETA_WORKING"`
	STABLE               int `json:"STABLE"`
	STABLE_DEPENDS_OTHERS int `json:"STABLE_DEPENDS_OTHERS"`
}

// Initialize database connection
func initDB() {
	config := Config{}
	file, err := os.Open(".env")
	if err != nil {
		log.Fatalf("Error opening .env file: %v", err)
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		log.Fatalf("Error decoding .env file: %v", err)
	}

	db, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true",
		config.DBUser, config.DBPassword, config.DBHost, config.DBName))
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	log.Println("Database connection established")
}

// Query database
func dbQuery(query string, args ...interface{}) ([]map[string]interface{}, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("db query error: %w", err)
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("db columns error: %w", err)
	}

	var results []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		scanArgs := make([]interface{}, len(columns))
		for i := range values {
			scanArgs[i] = &values[i]
		}

		err = rows.Scan(scanArgs...)
		if err != nil {
			return nil, fmt.Errorf("db scan error: %w", err)
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			if b, ok := val.([]byte); ok {
				row[col] = string(b)
			} else {
				row[col] = val
			}
		}
		results = append(results, row)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("db rows error: %w", err)
	}

	return results, nil
}

// Fetch one record from database
func dbFetchOne(query string, args ...interface{}) (map[string]interface{}, error) {
	results, err := dbQuery(query, args...)
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, nil
	}
	return results[0], nil
}

// Insert data into database
func dbInsert(table string, data map[string]interface{}) (int64, error) {
	var columns []string
	var placeholders []string
	var values []interface{}

	for k, v := range data {
		columns = append(columns, k)
		placeholders = append(placeholders, "?")
		values = append(values, v)
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, strings.Join(columns, ", "), strings.Join(placeholders, ", "))
	result, err := db.Exec(query, values...)
	if err != nil {
		return 0, fmt.Errorf("db insert error: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("db last insert id error: %w", err)
	}

	return id, nil
}

// Run action
func runAction(name string) (*ActionResponse, error) {
	query := `
		SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
		FROM action
		LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
		WHERE action.name=?
	`
	record, err := dbFetchOne(query, name)
	if err != nil {
		return nil, fmt.Errorf("run action db fetch error: %w", err)
	}
	if record == nil {
		log.Printf("✗  Action with ID %s not found.\n", name)
		return &ActionResponse{Success: false, Message: fmt.Sprintf("Action with ID %s not found.", name)}, nil
	}

	startTime := time.Now()
	result, err := executeAction(record)
	if err != nil {
		return nil, fmt.Errorf("run action execute error: %w", err)
	}
	endTime := time.Now()
	exeTime := int(endTime.Sub(startTime).Milliseconds())

	if result {
		err = updateStatus(record, ALPHA_RUNNING_READY, "Action completed", exeTime)
		if err != nil {
			return nil, fmt.Errorf("run action update status error: %w", err)
		}
		actionRecord := convertToRecord(record)
		return &ActionResponse{Success: true, Message: fmt.Sprintf("Action %s completed successfully", name), Data: actionRecord}, nil
	} else {
		err = updateStatus(record, INACTIVE_WRONG_FAILED, "Action failed", exeTime)
		if err != nil {
			return nil, fmt.Errorf("run action update status error: %w", err)
		}
		actionRecord := convertToRecord(record)
		return &ActionResponse{Success: false, Message: fmt.Sprintf("Action %s failed", name), Data: actionRecord}, nil
	}
}

// Action loop
func actionLoop() {
	mu.Lock()
	if executionRunning {
		mu.Unlock()
		log.Println("🏃‍♂️ Loop is already running")
		return
	}
	executionRunning = true
	mu.Unlock()

	defer func() {
		mu.Lock()
		executionRunning = false
		mu.Unlock()
	}()

	preLoopCounts, err := getActionStatusCounts()
	if err != nil {
		log.Printf("Error getting pre-loop status counts: %v\n", err)
		return
	}
	log.Println("Pre-Loop Status Counts:")
	printTable(preLoopCounts)

	query := `
		SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
		FROM action
		LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
		WHERE action.systemsid in (0,3)
		ORDER BY action.sort;
	`
	actions, err := dbQuery(query)
	if err != nil {
		log.Printf("Error fetching actions: %v\n", err)
		return
	}
	if len(actions) == 0 {
		log.Println("✗  No pending actions. Waiting...")
		return
	}

	total, success, statusStats, percentage, err := processActions(actions)
	if err != nil {
		log.Printf("Error processing actions: %v\n", err)
		return
	}
	log.Printf("📊 %d/%d --> %.2f %%success\n", success, total, percentage)

	postLoopCounts, err := getActionStatusCounts()
	if err != nil {
		log.Printf("Error getting post-loop status counts: %v\n", err)
		return
	}
	log.Println("🏁 Post-Loop Status Counts:")
	printTable(postLoopCounts)
}

// Process actions
func processActions(actions []map[string]interface{}) (int, int, map[string]int, float64, error) {
	total := 0
	success := 0
	statusStats := map[string]int{
		"DEPRECATED":           0,
		"DANGEROUS":            0,
		"MISSING_INFRASTRUCTURE": 0,
		"NEEDS_UPDATES":        0,
		"INACTIVE_WRONG_FAILED": 0,
		"NEW":                  0,
		"WORKING_TESTING_EXPERIMENTAL": 0,
		"ALPHA_RUNNING_READY":  0,
		"BETA_WORKING":         0,
		"STABLE":               0,
		"STABLE_DEPENDS_OTHERS": 0,
	}

	for _, rec := range actions {
		total++
		startTime := time.Now()
		result, err := executeAction(rec)
		if err != nil {
			statusStats["NEEDS_UPDATES"]++
			log.Printf("✗  Error processing action %v: %v\n", rec["id"], err)
			err = updateStatus(rec, NEEDS_UPDATES, err.Error(), 0)
			if err != nil {
				return 0, 0, nil, 0, fmt.Errorf("process actions update status error: %w", err)
			}
			continue
		}
		endTime := time.Now()
		exeTime := int(endTime.Sub(startTime).Milliseconds())

		if result {
			statusStats["ALPHA_RUNNING_READY"]++
			success++
			err = updateStatus(rec, ALPHA_RUNNING_READY, "Action completed", exeTime)
			if err != nil {
				return 0, 0, nil, 0, fmt.Errorf("process actions update status error: %w", err)
			}
		} else {
			statusStats["INACTIVE_WRONG_FAILED"]++
			err = updateStatus(rec, INACTIVE_WRONG_FAILED, "Action failed", exeTime)
			if err != nil {
				return 0, 0, nil, 0, fmt.Errorf("process actions update status error: %w", err)
			}
		}
	}

	percentage := 0.0
	if total > 0 {
		percentage = float64(success) / float64(total) * 100
	}
	return total, success, statusStats, percentage, nil
}

// Get action status counts
func getActionStatusCounts() (*StatusCounts, error) {
	queryParts := []string{
		"COUNT(CASE WHEN status = " + strconv.Itoa(DEPRECATED) + " THEN 1 END) as DEPRECATED",
		"COUNT(CASE WHEN status = " + strconv.Itoa(DANGEROUS) + " THEN 1 END) as DANGEROUS",
		"COUNT(CASE WHEN status = " + strconv.Itoa(MISSING_INFRASTRUCTURE) + " THEN 1 END) as MISSING_INFRASTRUCTURE",
		"COUNT(CASE WHEN status = " + strconv.Itoa(NEEDS_UPDATES) + " THEN 1 END) as NEEDS_UPDATES",
		"COUNT(CASE WHEN status = " + strconv.Itoa(INACTIVE_WRONG_FAILED) + " THEN 1 END) as INACTIVE_WRONG_FAILED",
		"COUNT(CASE WHEN status = " + strconv.Itoa(NEW) + " THEN 1 END) as NEW",
		"COUNT(CASE WHEN status = " + strconv.Itoa(WORKING_TESTING_EXPERIMENTAL) + " THEN 1 END) as WORKING_TESTING_EXPERIMENTAL",
		"COUNT(CASE WHEN status = " + strconv.Itoa(ALPHA_RUNNING_READY) + " THEN 1 END) as ALPHA_RUNNING_READY",
		"COUNT(CASE WHEN status = " + strconv.Itoa(BETA_WORKING) + " THEN 1 END) as BETA_WORKING",
		"COUNT(CASE WHEN status = " + strconv.Itoa(STABLE) + " THEN 1 END) as STABLE",
		"COUNT(CASE WHEN status = " + strconv.Itoa(STABLE_DEPENDS_OTHERS) + " THEN 1 END) as STABLE_DEPENDS_OTHERS",
	}
	query := "SELECT " + strings.Join(queryParts, ", ") + " FROM action WHERE systemsid in(0,3)"
	statusCounts, err := dbFetchOne(query)
	if err != nil {
		return nil, fmt.Errorf("get action status counts db fetch error: %w", err)
	}

	counts := &StatusCounts{}
	if val, ok := statusCounts["DEPRECATED"].(int64); ok {
		counts.DEPRECATED = int(val)
	}
	if val, ok := statusCounts["DANGEROUS"].(int64); ok {
		counts.DANGEROUS = int(val)
	}
	if val, ok := statusCounts["MISSING_INFRASTRUCTURE"].(int64); ok {
		counts.MISSING_INFRASTRUCTURE = int(val)
	}
	if val, ok := statusCounts["NEEDS_UPDATES"].(int64); ok {
		counts.NEEDS_UPDATES = int(val)
	}
	if val, ok := statusCounts["INACTIVE_WRONG_FAILED"].(int64); ok {
		counts.INACTIVE_WRONG_FAILED = int(val)
	}
	if val, ok := statusCounts["NEW"].(int64); ok {
		counts.NEW = int(val)
	}
	if val, ok := statusCounts["WORKING_TESTING_EXPERIMENTAL"].(int64); ok {
		counts.WORKING_TESTING_EXPERIMENTAL = int(val)
	}
	if val, ok := statusCounts["ALPHA_RUNNING_READY"].(int64); ok {
		counts.ALPHA_RUNNING_READY = int(val)
	}
	if val, ok := statusCounts["BETA_WORKING"].(int64); ok {
		counts.BETA_WORKING = int(val)
	}
	if val, ok := statusCounts["STABLE"].(int64); ok {
		counts.STABLE = int(val)
	}
	if val, ok := statusCounts["STABLE_DEPENDS_OTHERS"].(int64); ok {
		counts.STABLE_DEPENDS_OTHERS = int(val)
	}

	return counts, nil
}

// Get next interval time
func getNextIntervalTime(actions []map[string]interface{}) int {
	if len(actions) == 0 {
		return 10
	}
	var intervalTimes []int
	for _, a := range actions {
		if intervalTime, ok := a["interval_time"].(int64); ok && intervalTime > 0 {
			intervalTimes = append(intervalTimes, int(intervalTime))
		}
	}
	if len(intervalTimes) == 0 {
		return 10
	}
	minInterval := intervalTimes[0]
	for _, interval := range intervalTimes {
		if interval < minInterval {
			minInterval = interval
		}
	}
	return minInterval
}

// Execute action
func executeAction(rec map[string]interface{}) (bool, error) {
	actionType, ok := rec["type"].(string)
	if !ok {
		log.Printf("✗  Unknown type for action ID %v.\n", rec["id"])
		return false, nil
	}

	switch actionType {
	case "route":
		return buildRoute(rec)
	case "int_resource":
		return runInternalResource(rec)
	case "ext_resource":
		return runExternalResource(rec)
	case "generate", "ai":
		return buildAI(rec)
	case "N":
		return buildN(rec)
	case "fs":
		return true, nil
	default:
		log.Printf("✗  Unknown type '%s' for action ID %v.\n", actionType, rec["id"])
		return false, nil
	}
}

// Update endpoint params
func updateEndpointParams(endpoint string, params map[string]interface{}, name string) error {
	paramsJSON, err := json.Marshal(params)
	if err != nil {
		return fmt.Errorf("update endpoint params json marshal error: %w", err)
	}
	query := "UPDATE action SET params=?, endpoint=? WHERE actiongrp.name=?"
	_, err = db.Exec(query, string(paramsJSON), endpoint, name)
	if err != nil {
		return fmt.Errorf("update endpoint params db exec error: %w", err)
	}
	log.Printf("✓ Updated action table with: params = %s, endpoint = %s\n", string(paramsJSON), endpoint)
	return nil
}

// Update status
func updateStatus(rec map[string]interface{}, newStatus int, logMessage string, exeTime int) error {
	query := "UPDATE action SET status = ?, log = ?, updated = CURRENT_TIMESTAMP, exe_time = ? WHERE id = ?"
	_, err := db.Exec(query, newStatus, logMessage, exeTime, rec["id"])
	if err != nil {
		return fmt.Errorf("update status db exec error: %w", err)
	}
	log.Printf("💾 Action %v set to status %d\n", rec["id"], newStatus)
	return nil
}

// Parse JSDoc comments
func parseJsdoc(comment string) map[string]interface{} {
	re := regexp.MustCompile(`@params\s+({[\s\S]*?})`)
	match := re.FindStringSubmatch(comment)
	if len(match) > 1 {
		var params map[string]interface{}
		err := json.Unmarshal([]byte(match[1]), ¶ms)
		if err != nil {
			log.Printf("Invalid JSON after @params tag: %s\n", match[1])
			return map[string]interface{}{}
		}
		return params
	}
	return nil
}

// Scan routes
func scanRoutes(router *mux.Router, prefix string) []map[string]interface{} {
	var mappings []map[string]interface{}
	router.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		pathTemplate, err := route.GetPathTemplate()
		if err != nil {
			return err
		}
		methods, err := route.GetMethods()
		if err != nil {
			return err
		}
		var keys string
		var params map[string]interface{}
		if handler, ok := route.GetHandler().(func(http.ResponseWriter, *http.Request)); ok {
			keys = getFunctionName(handler)
			params = getFunctionParams(handler)
		}
		mappings = append(mappings, map[string]interface{}{
			"method": strings.Join(methods, ","),
			"path":   prefix + pathTemplate,
			"keys":   keys,
			"params": params,
		})
		return nil
	})
	return mappings
}

// Helper function to get function name
func getFunctionName(handler func(http.ResponseWriter, *http.Request)) string {
	name := runtime.FuncForPC(reflect.ValueOf(handler).Pointer()).Name()
	parts := strings.Split(name, ".")
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return "default-key"
}

// Helper function to get function params
func getFunctionParams(handler func(http.ResponseWriter, *http.Request)) map[string]interface{} {
	funcType := reflect.TypeOf(handler)
	params := make(map[string]interface{})
	for i := 0; i < funcType.NumIn(); i++ {
		paramType := funcType.In(i)
		params[fmt.Sprintf("param%d", i)] = paramType.String()
	}
	return params
}

// Check route health
func checkRouteHealth(rec map[string]interface{}) bool {
	healthEndpoint := "health"
	pingEndpoint := "ping"
	endpoints := []string{healthEndpoint, pingEndpoint}

	for _, endpoint := range endpoints {
		host, ok := rec["base"].(string)
		if !ok {
			log.Printf("✗ Invalid base URL for health check: %v\n", rec["base"])
			continue
		}
		fullURL := host + endpoint
		log.Printf("--> Checking health at: %s\n", fullURL)

		client := http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get(fullURL)
		if err != nil {
			log.Printf("✗ Health Check Error for: %s %v\n", fullURL, err)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("✗ Health Check Failed: %s status: %d %s\n", fullURL, resp.StatusCode, string(body))
			continue
		}
		log.Printf("✓ Health Check OK: %s\n", fullURL)
		return true
	}
	return false
}

// Build route
func buildRoute(rec map[string]interface{}) (bool, error) {
	grpName, ok := rec["grpName"].(string)
	if !ok {
		return false, errors.New("invalid grpName")
	}
	routerPath := filepath.Join("services", grpName, "routes.go")
	if _, err := os.Stat(routerPath); os.IsNotExist(err) {
		log.Printf("✗  Invalid path for action group: %s\n", grpName)
		return false, nil
	}

	router := mux.NewRouter()
	err := loadRoutes(router, routerPath)
	if err != nil {
		log.Printf("✗  Error loading route %s: %v\n", routerPath, err)
		return false, nil
	}

	// Register the router with the main router
	appRouter.PathPrefix(fmt.Sprintf("/ermis/v1/%s", grpName)).Handler(router)
	log.Printf("✓  %s routed.\n", grpName)

	routeMappings := scanRoutes(router, fmt.Sprintf("/ermis/v1/%s", grpName))
	return len(routeMappings) > 0, nil
}

// Load routes from file
func loadRoutes(router *mux.Router, routerPath string) error {
	// Load the routes from the file
	routes, err := loadGoRoutes(routerPath)
	if err != nil {
		return fmt.Errorf("load routes error: %w", err)
	}
	for _, route := range routes {
		if route.Path == "" || route.Handler == nil {
			continue
		}
		router.HandleFunc(route.Path, route.Handler).Methods(route.Methods...)
	}
	return nil
}

// Load go routes
func loadGoRoutes(routerPath string) ([]*Route, error) {
	// Load the routes from the file
	content, err := os.ReadFile(routerPath)
	if err != nil {
		return nil, fmt.Errorf("load go routes read file error: %w", err)
	}
	// Define a regular expression to match route definitions
	re := regexp.MustCompile(`router\.HandleFunc\("([^"]+)",\s*([^)]+)\).Methods\(([^)]+)\)`)
	matches := re.FindAllStringSubmatch(string(content), -1)
	var routes []*Route
	for _, match := range matches {
		if len(match) != 4 {
			continue
		}
		path := match[1]
		handlerName := match[2]
		methods := strings.Split(strings.ReplaceAll(match[3], "\"", ""), ",")
		handler, err := getHandler(handlerName)
		if err != nil {
			log.Printf("Error getting handler: %v\n", err)
			continue
		}
		routes = append(routes, &Route{
			Path:    path,
			Handler: handler,
			Methods: methods,
		})
	}
	return routes, nil
}

// Route struct
type Route struct {
	Path    string
	Handler func(http.ResponseWriter, *http.Request)
	Methods []string
}

// Get handler
func getHandler(handlerName string) (func(http.ResponseWriter, *http.Request), error) {
	// Get the handler function by name
	switch handlerName {
	case "healthCheckHandler":
		return healthCheckHandler, nil
	case "pingCheckHandler":
		return pingCheckHandler, nil
	default:
		return nil, fmt.Errorf("handler not found: %s", handlerName)
	}
}

// Health check handler
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Ping check handler
func pingCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "pong"})
}

// Build AI
func buildAI(rec map[string]interface{}) (bool, error) {
	endpoint, ok := rec["endpoint"].(string)
	if !ok {
		return false, errors.New("invalid endpoint")
	}
	parts := strings.Split(endpoint, ",")
	if len(parts) != 2 {
		return false, errors.New("invalid endpoint format")
	}
	method := parts[0]
	rawURL := parts[1]

	url, err := renderKeys(rawURL, rec)
	if err != nil {
		return false, fmt.Errorf("build ai render keys error: %w", err)
	}

	if method == "POST" {
		log.Printf("--> Processing AI POST request to: %s\n", url)
		payload, ok := rec["payload"].(string)
		if !ok {
			payload = "{}"
		}
		var payloadData map[string]interface{}
		err = json.Unmarshal([]byte(payload), &payloadData)
		if err != nil {
			return false, fmt.Errorf("build ai json unmarshal error: %w", err)
		}

		client := http.Client{Timeout: 10 * time.Second}
		reqBody, err := json.Marshal(payloadData)
		if err != nil {
			return false, fmt.Errorf("build ai json marshal error: %w", err)
		}
		req, err := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
		if err != nil {
			return false, fmt.Errorf("build ai new request error: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			return false, fmt.Errorf("build ai client do error: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			body, _ := io.ReadAll(resp.Body)
			return false, fmt.Errorf("build ai http error! status: %d %s", resp.StatusCode, string(body))
		}

		var data map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&data)
		if err != nil {
			return false, fmt.Errorf("build ai json decode error: %w", err)
		}
		log.Printf("%s AI responded with data: %v\n", rec["name"], data)
		return true, nil
	} else {
		log.Printf("✗  Unsupported HTTP method for AI: %s\n", method)
		return false, nil
	}
}

// Render keys
func renderKeys(rawURL string, rec map[string]interface{}) (string, error) {
	keys, ok := rec["keys"].(string)
	if !ok {
		keys = ""
	}
	keyValuePairs := make(map[string]string)
	for _, pair := range strings.Split(keys, ",") {
		parts := strings.SplitN(pair, "=", 2)
		if len(parts) == 2 {
			keyValuePairs[parts[0]] = parts[1]
		}
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("render keys url parse error: %w", err)
	}

	queryParams := parsedURL.Query()
	for key, values := range queryParams {
		for i, value := range values {
			if strings.HasPrefix(value, "{") && strings.HasSuffix(value, "}") {
				varName := value[1 : len(value)-1]
				if val, ok := keyValuePairs[varName]; ok {
					queryParams.Set(key, val)
				}
			}
		}
	}
	parsedURL.RawQuery = queryParams.Encode()
	return parsedURL.String(), nil
}
// Get resources params
func getResourcesParams(r *http.Request) map[string]interface{} {
	params := make(map[string]interface{})
	queryParams := make(map[string]interface{})
	for key, values := range r.URL.Query() {
		queryParams[key] = values
	}
	params["query"] = queryParams
	headers := make(map[string]interface{})
	for key, values := range r.Header {
		headers[key] = values
	}
	params["headers"] = headers
	cookies := make(map[string]interface{})
	for _, cookie := range r.Cookies() {
		cookies[cookie.Name] = cookie.Value
	}
	params["cookies"] = cookies
	return params
}

// Render keys in text
func renderKeysInText(text string, data map[string]interface{}) (string, error) {
	re := regexp.MustCompile(`{{(.*?)}}`)
	matches := re.FindAllStringSubmatch(text, -1)
	rendered := text
	for _, match := range matches {
		if len(match) != 2 {
			continue
		}
		key := strings.TrimSpace(match[1])
		value, err := getNestedValue(data, key)
		if err != nil {
			log.Printf("Error getting nested value for key %s: %v\n", key, err)
			continue
		}
		rendered = strings.ReplaceAll(rendered, match[0], fmt.Sprintf("%v", value))
	}
	return rendered, nil
}

// Helper function to get nested value
func getNestedValue(data map[string]interface{}, key string) (interface{}, error) {
	keys := strings.Split(key, ".")
	var current interface{} = data
	for _, k := range keys {
		if currentMap, ok := current.(map[string]interface{}); ok {
			if val, ok := currentMap[k]; ok {
				current = val
			} else {
				return "", fmt.Errorf("key '%s' not found", k)
			}
		} else {
			return "", fmt.Errorf("invalid data structure for key '%s'", k)
		}
	}
	return current, nil
}

// Run external resource
func runExternalResource(rec map[string]interface{}) (bool, error) {
	endpoint, ok := rec["endpoint"].(string)
	if !ok {
		return false, errors.New("invalid endpoint")
	}
	parts := strings.Split(endpoint, ",")
	if len(parts) != 2 {
		return false, errors.New("invalid endpoint format")
	}
	method := parts[0]
	rawURL := parts[1]

	url, err := renderKeys(rawURL, rec)
	if err != nil {
		return false, fmt.Errorf("run external resource render keys error: %w", err)
	}

	var data interface{}
	var resp *http.Response

	if method == "GET" || method == "POST" {
		log.Printf("--> Processing %s request to: %s\n", method, url)
		client := http.Client{Timeout: 10 * time.Second}
		var req *http.Request
		if method == "POST" {
			bodyData, err := renderKeysInText(fmt.Sprintf("%v", rec["body"]), rec)
			if err != nil {
				return false, fmt.Errorf("run external resource render keys in text error: %w", err)
			}
			log.Printf("--> POST body: %s\n", bodyData)
			req, err = http.NewRequest("POST", url, strings.NewReader(bodyData))
			if err != nil {
				return false, fmt.Errorf("run external resource new request error: %w", err)
			}
			req.Header.Set("Content-Type", "application/json")
		} else {
			req, err = http.NewRequest("GET", url, nil)
			if err != nil {
				return false, fmt.Errorf("run external resource new request error: %w", err)
			}
		}

		resp, err = client.Do(req)
		if err != nil {
			return false, fmt.Errorf("run external resource client do error: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			body, _ := io.ReadAll(resp.Body)
			return false, fmt.Errorf("run external resource http error! status: %d %s", resp.StatusCode, string(body))
		}

		err = json.NewDecoder(resp.Body).Decode(&data)
		if err != nil {
			return false, fmt.Errorf("run external resource json decode error: %w", err)
		}
		log.Printf("✓ %s Responsed with data\n", rec["name"])
		jsonData, err := json.MarshalIndent(data, "", "  ")
		if err != nil {
			return false, fmt.Errorf("run external resource json marshal error: %w", err)
		}
		log.Printf("%s\n", string(jsonData))
		return true, nil
	} else {
		log.Printf("✗  Unsupported HTTP method: %s\n", method)
		return false, nil
	}
}

// Run internal resource
func runInternalResource(rec map[string]interface{}) (bool, error) {
	requires, ok := rec["requires"].(string)
	if ok && requires != "" {
		err := loadRequiredModule(requires)
		if err != nil {
			log.Printf("Error loading required module %s: %v\n", requires, err)
			return false, nil
		}
	}

	endpoint, ok := rec["endpoint"].(string)
	if !ok {
		return false, errors.New("invalid endpoint")
	}
	parts := strings.Split(endpoint, ",")
	if len(parts) != 2 {
		return false, errors.New("invalid endpoint format")
	}
	method := parts[0]
	path := parts[1]

	if method != "GET" {
		log.Printf("✗  Unsupported HTTP method: %s\n", method)
		return false, nil
	}
	if path == "" {
		log.Println("✗  Path not defined")
		return false, nil
	}
	log.Printf("--> Processing internal GET request to: %s\n", path)

	grpName, ok := rec["grpName"].(string)
	if !ok {
		return false, errors.New("invalid grpName")
	}
	file := filepath.Join("services", grpName, "docs", "index.html")
	if _, err := os.Stat(file); os.IsNotExist(err) {
		log.Printf("✗ File not found: %s\n", file)
		return false, nil
	}

	appRouter.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
		params := getResourcesParams(r)
		rec["action"] = map[string]interface{}{
			"params": params,
		}
		log.Printf("--> Params: %v\n", params)
		actionJSON, err := json.Marshal(rec["action"])
		if err != nil {
			log.Printf("Error marshaling action: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		query := "UPDATE action SET action=? WHERE id=?"
		_, err = db.Exec(query, string(actionJSON), rec["id"])
		if err != nil {
			log.Printf("✗ Error updating action params: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		log.Printf("✓ Updated system %v with params: %v\n", rec["id"], params)
		http.ServeFile(w, r, file)
	})
	log.Printf("✓ %s served from internal endpoint\n", rec["name"])
	return true, nil
}

// Load required module
func loadRequiredModule(requires string) error {
	// Placeholder for loading required modules
	// In a real application, you would load and execute Go code here
	log.Printf("Loading required module: %s\n", requires)
	return nil
}

// Build chat
func buildChat(rec map[string]interface{}) (bool, error) {
	log.Printf("Processing Chat #%v; \n", rec["id"])
	return true, nil
}

// Build stream
func buildStream(rec map[string]interface{}) (bool, error) {
	log.Printf("Processing Stream #%v; \n", rec["id"])
	return true, nil
}

// Build authentication
func buildAuthentication(rec map[string]interface{}) (bool, error) {
	log.Printf("Processing Authenticate #%v; \n", rec["id"])
	return true, nil
}

// Build N
func buildN(rec map[string]interface{}) (bool, error) {
	statement, ok := rec["statement"].(string)
	execute, ok2 := rec["execute"].(string)
	if ok || ok2 {
		// Placeholder for message publishing
		// In a real application, you would publish a message here
		log.Printf("Processing action N: %v, %v\n", statement, execute)
	}
	return true, nil
}

// Upsert action
func upsertAction(actionGrpData ActionGrpData, actionData ActionData) (map[string]interface{}, error) {
	metaJSON, err := json.Marshal(actionGrpData.Meta)
	if err != nil {
		return nil, fmt.Errorf("upsert action json marshal error: %w", err)
	}
	actionGrpInsertData := map[string]interface{}{
		"name":        actionGrpData.Name,
		"description": actionGrpData.Description,
		"base":        actionGrpData.Base,
		"meta":        string(metaJSON),
	}
	actionGrpID, err := dbInsert("actiongrp", actionGrpInsertData)
	if err != nil {
		return nil, fmt.Errorf("upsert action db insert actiongrp error: %w", err)
	}
	if actionGrpID == 0 {
		return nil, errors.New("error inserting actiongrp")
	}

	bodyJSON, err := json.Marshal(actionData.Body)
	if err != nil {
		return nil, fmt.Errorf("upsert action json marshal body error: %w", err)
	}
	actionInsertData := map[string]interface{}{
		"name":        actionData.Name,
		"systemsid":   actionData.Systemsid,
		"actiongrpid": actionGrpID,
		"endpoint":    actionData.Endpoint,
		"payload":     actionData.Payload,
		"body":        string(bodyJSON),
		"requires":    actionData.Requires,
		"interval_time": actionData.IntervalTime,
		"sort":        actionData.Sort,
		"type":        actionData.Type,
		"keys":        actionData.Keys,
		"statement":   actionData.Statement,
		"execute":     actionData.Execute,
	}
	actionID, err := dbInsert("action", actionInsertData)
	if err != nil {
		return nil, fmt.Errorf("upsert action db insert action error: %w", err)
	}
	if actionID == 0 {
		return nil, errors.New("error inserting action")
	}

	return map[string]interface{}{
		"actiongrpid": actionGrpID,
		"actionid":    actionID,
	}, nil
}

// Convert to ActionRecord
func convertToRecord(record map[string]interface{}) *ActionRecord {
	var actionRecord ActionRecord
	if id, ok := record["id"].(int64); ok {
		actionRecord.ID = int(id)
	}
	if name, ok := record["name"].(string); ok {
		actionRecord.Name = name
	}
	if actiongrpid, ok := record["actiongrpid"].(int64); ok {
		actionRecord.Actiongrpid = int(actiongrpid)
	}
	if systemsid, ok := record["systemsid"].(int64); ok {
		actionRecord.Systemsid = int(systemsid)
	}
	if endpoint, ok := record["endpoint"].(string); ok {
		actionRecord.Endpoint = endpoint
	}
	if status, ok := record["status"].(int64); ok {
		actionRecord.Status = int(status)
	}
	if log, ok := record["log"].(string); ok {
		actionRecord.Log = log
	}
	if updated, ok := record["updated"].(time.Time); ok {
		actionRecord.Updated = updated
	}
	if exeTime, ok := record["exe_time"].(int64); ok {
		actionRecord.ExeTime = int(exeTime)
	}
	if keys, ok := record["keys"].(string); ok {
		actionRecord.Keys = keys
	}
	if payload, ok := record["payload"].(string); ok {
		actionRecord.Payload = payload
	}
	if body, ok := record["body"].(string); ok {
		var bodyData interface{}
		json.Unmarshal([]byte(body), &bodyData)
		actionRecord.Body = bodyData
	}
	if requires, ok := record["requires"].(string); ok {
		actionRecord.Requires = requires
	}
	if intervalTime, ok := record["interval_time"].(int64); ok {
		actionRecord.IntervalTime = int(intervalTime)
	}
	if sort, ok := record["sort"].(int64); ok {
		actionRecord.Sort = int(sort)
	}
	if actionType, ok := record["type"].(string); ok {
		actionRecord.Type = actionType
	}
	if grpName, ok := record["grpName"].(string); ok {
		actionRecord.GrpName = grpName
	}
	if base, ok := record["base"].(string); ok {
		actionRecord.Base = base
	}
	return &actionRecord
}

// Print table
func printTable(data interface{}) {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Printf("Error marshaling data: %v\n", err)
		return
	}
	fmt.Println(string(jsonData))
}

// Main function
func main() {
	godotenv.Load()
	root = os.Getenv("ROOT")
	if root == "" {
		root = filepath.Dir(os.Args[0])
	}
	initDB()
	defer db.Close()

	appRouter = mux.NewRouter()

	appRouter.HandleFunc("/action/{name}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		name := vars["name"]
		resp, err := runAction(name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}).Methods("GET")

	appRouter.HandleFunc("/action", func(w http.ResponseWriter, r *http.Request) {
		var actionGrpData ActionGrpData
		var actionData ActionData
		err := json.NewDecoder(r.Body).Decode(&struct {
			ActionGrpData *ActionGrpData `json:"actionGrpData"`
			ActionData    *ActionData    `json:"actionData"`
		}{&actionGrpData, &actionData})
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		resp, err := upsertAction(actionGrpData, actionData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}).Methods("POST")

	appRouter.HandleFunc("/loop", func(w http.ResponseWriter, r *http.Request) {
		go actionLoop()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Action loop started"})
	}).Methods("GET")

	appRouter.HandleFunc("/status_counts", func(w http.ResponseWriter, r *http.Request) {
		counts, err := getActionStatusCounts()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(counts)
	}).Methods("GET")

	appRouter.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}).Methods("GET")

	appRouter.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "pong"})
	}).Methods("GET")

	go func() {
		for {
			actionLoop()
			query := `
				SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
				FROM action
				LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
				WHERE action.systemsid in (0,3)
				ORDER BY action.sort;
			`
			actions, err := dbQuery(query)
			if err != nil {
				log.Printf("Error fetching actions for interval: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}
			interval := getNextIntervalTime(actions)
			time.Sleep(time.Duration(interval) * time.Second)
		}
	}()

	log.Println("Server starting on port 8000")
	http.ListenAndServe(":8000", appRouter)
}