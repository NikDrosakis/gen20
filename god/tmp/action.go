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
package core

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
// ... (imports remain the same)

// Maria struct for database operations
type Maria struct {
	db *sql.DB
}

// NewMaria initializes a new Maria struct
func NewMaria(dsn string) (*Maria, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("error pinging database: %w", err)
	}
	return &Maria{db: db}, nil
}

// Query database
func (m *Maria) Query(query string, args ...interface{}) ([]map[string]interface{}, error) {
	rows, err := m.db.Query(query, args...)
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
func (m *Maria) FetchOne(query string, args ...interface{}) (map[string]interface{}, error) {
	results, err := m.Query(query, args...)
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, nil
	}
	return results[0], nil
}

// Insert data into database
func (m *Maria) Insert(table string, data map[string]interface{}) (int64, error) {
	var columns []string
	var placeholders []string
	var values []interface{}

	for k, v := range data {
		columns = append(columns, k)
		placeholders = append(placeholders, "?")
		values = append(values, v)
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, strings.Join(columns, ", "), strings.Join(placeholders, ", "))
	result, err := m.db.Exec(query, values...)
	if err != nil {
		return 0, fmt.Errorf("db insert error: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("db last insert id error: %w", err)
	}

	return id, nil
}

// Close database connection
func (m *Maria) Close() error {
	if m.db != nil {
		err := m.db.Close()
		if err != nil {
			return fmt.Errorf("error closing database connection: %w", err)
		}
	}
	return nil
}

// Global Variables (Encapsulated)
type AppState struct {
	executionRunning bool
	mu               sync.Mutex
	db               *Maria
	root             string
	httpClient       *http.Client
}

var appState *AppState

// Initialize database connection
func initDB(config Config) (*Maria, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true",
		config.DBUser, config.DBPassword, config.DBHost, config.DBName)
	maria, err := NewMaria(dsn)
	if err != nil {
		return nil, fmt.Errorf("error initializing database: %w", err)
	}
	return maria, nil
}

// Initialize app state
func initAppState() (*AppState, error) {
	config := Config{}
	file, err := os.Open(".env")
	if err != nil {
		return nil, fmt.Errorf("error opening .env file: %w", err)
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		return nil, fmt.Errorf("error decoding .env file: %w", err)
	}

	maria, err := initDB(config)
	if err != nil {
		return nil, fmt.Errorf("error initializing database: %w", err)
	}

	root := os.Getenv("ROOT")
	if root == "" {
		root = filepath.Dir(os.Args[0])
	}

	httpClient := &http.Client{Timeout: 10 * time.Second}

	return &AppState{
		executionRunning: false,
		mu:               sync.Mutex{},
		db:               maria,
		root:             root,
		httpClient:       httpClient,
	}, nil
}

// Run action
func (s *AppState) runAction(name string) (*ActionResponse, error) {
	query := `
		SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
		FROM action
		LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
		WHERE action.name=?
	`
	record, err := s.db.FetchOne(query, name)
	if err != nil {
		return nil, fmt.Errorf("run action db fetch error: %w", err)
	}
	if record == nil {
		log.Printf("✗  Action with ID %s not found.\n", name)
		return &ActionResponse{Success: false, Message: fmt.Sprintf("Action with ID %s not found.", name)}, nil
	}

	startTime := time.Now()
	result, err := s.executeAction(record)
	if err != nil {
		return nil, fmt.Errorf("run action execute error: %w", err)
	}
	endTime := time.Now()
	exeTime := int(endTime.Sub(startTime).Milliseconds())

	if result {
		err = s.updateStatus(record, ALPHA_RUNNING_READY, "Action completed", exeTime)
		if err != nil {
			return nil, fmt.Errorf("run action update status error: %w", err)
		}
		actionRecord := convertToRecord(record)
		return &ActionResponse{Success: true, Message: fmt.Sprintf("Action %s completed successfully", name), Data: actionRecord}, nil
	} else {
		err = s.updateStatus(record, INACTIVE_WRONG_FAILED, "Action failed", exeTime)
		if err != nil {
			return nil, fmt.Errorf("run action update status error: %w", err)
		}
		actionRecord := convertToRecord(record)
		return &ActionResponse{Success: false, Message: fmt.Sprintf("Action %s failed", name), Data: actionRecord}, nil
	}
}

// Action loop
func (s *AppState) actionLoop() {
	s.mu.Lock()
	if s.executionRunning {
		s.mu.Unlock()
		log.Println("🏃‍♂️ Loop is already running")
		return
	}
	s.executionRunning = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		s.executionRunning = false
		s.mu.Unlock()
	}()

	preLoopCounts, err := s.getActionStatusCounts()
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
	actions, err := s.db.Query(query)
	if err != nil {
		log.Printf("Error fetching actions: %v\n", err)
		return
	}
	if len(actions) == 0 {
		log.Println("✗  No pending actions. Waiting...")
		return
	}

	total, success, statusStats, percentage, err := s.processActions(actions)
	if err != nil {
		log.Printf("Error processing actions: %v\n", err)
		return
	}
	log.Printf("📊 %d/%d --> %.2f %%success\n", success, total, percentage)

	postLoopCounts, err := s.getActionStatusCounts()
	if err != nil {
		log.Printf("Error getting post-loop status counts: %v\n", err)
		return
	}
	log.Println("🏁 Post-Loop Status Counts:")
	printTable(postLoopCounts)
}

// Process actions
func (s *AppState) processActions(actions []map[string]interface{}) (int, int, map[string]int, float64, error) {
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
		result, err := s.executeAction(rec)
		if err != nil {
			statusStats["NEEDS_UPDATES"]++
			log.Printf("✗  Error processing action %v: %v\n", rec["id"], err)
			err = s.updateStatus(rec, NEEDS_UPDATES, err.Error(), 0)
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
			err = s.updateStatus(rec, ALPHA_RUNNING_READY, "Action completed", exeTime)
			if err != nil {
				return 0, 0, nil, 0, fmt.Errorf("process actions update status error: %w", err)
			}
		} else {
			statusStats["INACTIVE_WRONG_FAILED"]++
			err = s.updateStatus(rec, INACTIVE_WRONG_FAILED, "Action failed", exeTime)
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
func (s *AppState) getActionStatusCounts() (*StatusCounts, error) {
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
	statusCounts, err := s.db.FetchOne(query)
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
func (s *AppState) getNextIntervalTime(actions []map[string]interface{}) int {
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
func (s *AppState) executeAction(rec map[string]interface{}) (bool, error) {
	actionType, ok := rec["type"].(string)
	if !ok {
		log.Printf("✗  Unknown type for action ID %v.\n", rec["id"])
		return false, nil
	}

	switch actionType {
	case "route":
		return s.buildRoute(rec)
	case "int_resource":
		return s.runInternalResource(rec)
	case "ext_resource":
		return s.runExternalResource(rec)
	case "generate", "ai":
		return s.buildAI(rec)
	case "N":
		return s.buildN(rec)
	case "fs":
		return true, nil
	default:
		log.Printf("✗  Unknown type '%s' for action ID %v.\n", actionType, rec["id"])
		return false, nil
	}
}

// Update endpoint params
func (s *AppState) updateEndpointParams(endpoint string, params map[string]interface{}, name string) error {
	paramsJSON, err := json.Marshal(params)
	if err != nil {
		return fmt.Errorf("update endpoint params json marshal error: %w", err)
	}
	query := "UPDATE action SET params=?, endpoint=? WHERE actiongrp.name=?"
	_, err = s.db.db.Exec(query, string(paramsJSON), endpoint, name)
	if err != nil {
		return fmt.Errorf("update endpoint params db exec error: %w", err)
	}
	log.Printf("✓ Updated action table with: params = %s, endpoint = %s\n", string(paramsJSON), endpoint)
	return nil
}

// Update status
func (s *AppState) updateStatus(rec map[string]interface{}, newStatus int, logMessage string, exeTime int) error {
	query := "UPDATE action SET status = ?, log = ?, updated = CURRENT_TIMESTAMP, exe_time = ? WHERE id = ?"
	_, err := s.db.db.Exec(query, newStatus, logMessage, exeTime, rec["id"])
	if err != nil {
		return fmt.Errorf("update status db exec error: %w", err)
	}
	log.Printf("💾 Action %v set to status %d\n", rec["id"], newStatus)
	return nil
}

// Parse JSDoc comments
func (s *AppState) parseJsdoc(comment string) map[string]interface{} {
	re := regexp.MustCompile(`@params\s+({[\s\S]*?})`)
	match := re.FindStringSubmatch(comment)
	if len(match) > 1 {
		var params map[string]interface{}  // Use 'params' as the unmarshaling target
		err := json.Unmarshal([]byte(match[1]), &params)  // Fix: unmarshal into 'params'
		if err != nil {
			log.Printf("Invalid JSON after @params tag: %s\n", match[1])
			return map[string]interface{}{}
		}
		return params
	}
	return nil
}

// Scan routes
func (s *AppState) scanRoutes(router *mux.Router, prefix string) []map[string]interface{} {
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
func (s *AppState) checkRouteHealth(rec map[string]interface{}) bool {
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

		resp, err := s.httpClient.Get(fullURL)
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
func (s *AppState) buildRoute(rec map[string]interface{}) (bool, error) {
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
	err := s.loadRoutes(router, routerPath)
	if err != nil {
		log.Printf("✗  Error loading route %s: %v\n", routerPath, err)
		return false, nil
	}

	// Register the router with the main router
	appRouter.PathPrefix(fmt.Sprintf("/ermis/v1/%s", grpName)).Handler(router)
	log.Printf("✓  %s routed.\n", grpName)

	routeMappings := s.scanRoutes(router, fmt.Sprintf("/ermis/v1/%s", grpName))
	return len(routeMappings) > 0, nil
}

// Load routes from file
func (s *AppState) loadRoutes(router *mux.Router, routerPath string) error {
	// Load the routes from the file
	routes, err := s.loadGoRoutes(routerPath)
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
func (s *AppState) loadGoRoutes(routerPath string) ([]*Route, error) {
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
func (s *AppState) buildAI(rec map[string]interface{}) (bool, error) {
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

	url, err := s.renderKeys(rawURL, rec)
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

		reqBody, err := json.Marshal(payloadData)
		if err != nil {
			return false, fmt.Errorf("build ai json marshal error: %w", err)
		}

		req, err := http.NewRequest("POST", url, strings.NewReader(string(reqBody)))
		if err != nil {
			return false, fmt.Errorf("build ai new request error: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(req)
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