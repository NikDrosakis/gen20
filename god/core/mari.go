package core

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

type Mari struct {
	db *sql.DB
}

// Initialize database connection
func NewMari(dsn string) (*Mari, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	return &Mari{db: db}, nil
}


// Insert function with optional ID
func (m *Mari) Inse(table string, params map[string]interface{}, id *int64) (int64, error) {
	columns := ""
	values := ""
	valArgs := []interface{}{}

	for col, val := range params {
		columns += col + ","
		values += "?,"
		valArgs = append(valArgs, val)
	}
	columns = columns[:len(columns)-1]
	values = values[:len(values)-1]

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, columns, values)
	if id != nil {
		query = fmt.Sprintf("INSERT INTO %s (id,%s) VALUES (?,%s)", table, columns, values)
		valArgs = append([]interface{}{*id}, valArgs...)
	}

	result, err := m.db.Exec(query, valArgs...)
	if err != nil {
		return 0, err
	}

	insertedId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return insertedId, nil
}

// Fetch single row result
// Fetch single row result
func (m *Mari) F(query string, params ...interface{}) (map[string]interface{}, error) {
	rows, err := m.db.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

    if !rows.Next() {
        return nil, sql.ErrNoRows
    }

	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))

	for i := range values {
		valuePtrs[i] = &values[i]
	}

	err = rows.Scan(valuePtrs...)
	if err != nil {
		return nil, err
	}

	result := make(map[string]interface{})
	for i, col := range columns {
		result[col] = values[i]
	}

	return result, nil
}
// Fetch multiple rows
func (m *Mari) Fa(query string, params ...interface{}) ([]map[string]interface{}, error) {
	rows, err := m.db.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	results := []map[string]interface{}{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		err = rows.Scan(valuePtrs...)
		if err != nil {
			return nil, err
		}

		result := make(map[string]interface{})
		for i, col := range columns {
			result[col] = values[i]
		}

		results = append(results, result)
	}

	return results, nil
}

// Query method for INSERT, UPDATE, DELETE
func (m *Mari) Q(query string, params ...interface{}) (bool, error) {
	_, err := m.db.Exec(query, params...)
	if err != nil {
		return false, err
	}
	return true, nil
}

// Fetch table columns
func (m *Mari) Columns(table string) ([]string, error) {
	rows, err := m.db.Query("DESCRIBE " + table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := []string{}
	for rows.Next() {
		var field string
		var columnType, nullable, key, def, extra sql.NullString
		err := rows.Scan(&field, &columnType, &nullable, &key, &def, &extra)
		if err != nil {
			return nil, err
		}
		columns = append(columns, field)
	}

	return columns, nil
}

// Count function
func (m *Mari) Count(rowt, table, clause string, params ...interface{}) (int, error) {
	var count int
	query := fmt.Sprintf("SELECT COUNT(%s) FROM %s %s", rowt, table, clause)
	err := m.db.QueryRow(query, params...).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// Fetch key-value pairs
func (m *Mari) FPairs(row1, row2, table, clause string) (map[string]string, error) {
	rows, err := m.db.Query(fmt.Sprintf("SELECT %s, %s FROM %s %s", row1, row2, table, clause))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pairs := make(map[string]string)
	for rows.Next() {
		var key, value string
		err := rows.Scan(&key, &value)
		if err != nil {
			return nil, err
		}
		pairs[key] = value
	}
	return pairs, nil
}
