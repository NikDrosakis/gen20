use sqlx::{mysql::MySqlPool, Error, query_as, query};
use std::collections::HashMap;

struct Maria {
    pool: MySqlPool,
}

impl Maria {
    pub async fn new(database_url: &str) -> Result<Self, Error> {
        let pool = MySqlPool::connect(database_url).await?;
        Ok(Maria { pool })
    }

    async fn is(&self, name: &str) -> Result<Option<String>, Error> {
        let result: Option<(String,)> = query_as("SELECT en FROM globs WHERE name = ?")
            .fetch_one(self.pool.get_ref()) // Access pool using self.pool
            .await
            .expect("Query failed");
        Ok(result.map(|(en,)| en))
    }

}