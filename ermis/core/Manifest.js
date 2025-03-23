const fs = require('fs');
const yaml = require('js-yaml');
const Maria = require('./Maria');

class Yaml {
    constructor() {
        this.maria = new Maria();
    }

    /**
     * Parse YAML content from a file.
     * @param {string} yamlFile - The path to the YAML file.
     * @returns {object} - The parsed YAML content as an object.
     */
    async yamlParseFile(yamlFile = '') {
        let yamlContent;
        // Check if input is a file path or direct YAML content
        if (fs.existsSync(yamlFile)) {
            yamlContent = fs.readFileSync(yamlFile, 'utf-8');
        } else {
            throw new Error("File does not exist.");
        }

        // Parse YAML to object
        const parsedData = yaml.load(yamlContent);

        // Check if the YAML parsed successfully
        if (!parsedData) {
            throw new Error("Invalid YAML content");
        }

        return parsedData;
    }

    /**
     * Update the database using data from a YAML file.
     * @param {string} path - The path to the YAML file.
     */
    async yamlUpdateDB(path = '') {
        if (fs.existsSync(path)) {
            const yamlParsed = await this.yamlParseFile(path);

            // Extract the central key (assumed to be the table name)
            const centralKey = Object.keys(yamlParsed)[0];
            if (!centralKey || typeof yamlParsed[centralKey] !== 'object') {
                throw new Error("Invalid structure in YAML file");
            }

            const yamlParsedKeyless = yamlParsed[centralKey];
            const update = await this.maria.upsert(centralKey, yamlParsedKeyless);

            if (update) {
                console.log("Database updated successfully.");
            } else {
                console.log("Failed to update the database.");
            }
        } else {
            console.log("File does not exist.");
        }
    }

    /**
     * Fetch data from the database and convert it to a YAML file.
     * @param {string} query - The SQL query to execute.
     * @param {object} params - Parameters for the SQL query.
     */
    async yamlFromDB(query, params = []) {
        const results = await this.maria.f(query, params);

        // Extract the table name from the query
        const match = query.match(/FROM\s+`?(\w+)`?/i);
        const table = match ? match[1] : null;
        if (!table) {
            throw new Error("Table name could not be determined from the query.");
        }

        // Get the column format (comments) for the table
        const columnsFormat = await this.maria.colFormat(table);

        // Process the results by extending the column format
        const extendedRow = {
            [table]: this.maria.extendColumnFormat(results, columnsFormat)
        };

        // Convert the array to YAML format
        const yamlRaw = yaml.dump(extendedRow);

        // Save the YAML to a file
        const filePath = `${process.env.ADMIN_ROOT}/data.yml`;
        fs.writeFileSync(filePath, yamlRaw, 'utf-8');

        console.log(`YAML file saved to ${filePath}.`);
    }
}

module.exports = Yaml;
