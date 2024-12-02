use actix_web::{get, App, HttpServer, Responder, web};
use dotenv::dotenv;
#[get("/hello")]
async fn hello(name: web::Path<String>) -> impl Responder {
    format!("Hello, {}!", name)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok(); // Load environment variables

    // Start the server
    HttpServer::new(move || {
        App::new()
            .service(hello)
    })
        .bind("0.0.0.0:3005")?
        .run()
        .await
}