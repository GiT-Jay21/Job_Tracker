// Simple Axum + MongoDB backend for a job-application tracker.

use axum::{routing::get, Router, extract::Extension, response::IntoResponse, http::StatusCode};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod routes;
mod db;
mod models;

use mongodb::Client;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Set up tracing/logging. Useful for development and debugging.
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Read the MongoDB connection string from the environment. Fall back to
    // a sensible local default for development.
    let mongo_uri = std::env::var("MONGO_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    tracing::info!("Connecting to Mongo at {}", mongo_uri);

    // Create and validate the MongoDB client.
    let client = db::create_client(&mongo_uri).await?;
    db::ping(&client).await?;

    let app = Router::new()
        .route("/", get(root))
        .merge(routes::job_routes())
        .layer(Extension(client.clone()));

    // Start the HTTP server and serve the Axum application.
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("Starting server at http://{}", addr);
    axum::Server::bind(&addr)
    // use into_make_service_with_connect_info which is available on Router and
    // provides the client's remote address to handlers if needed.
    .serve(app.into_make_service_with_connect_info::<SocketAddr>())
    .await
    .map_err(|e| anyhow::anyhow!(e))?;

    Ok(())
}

async fn root(Extension(_client): Extension<Client>) -> impl IntoResponse {
    // Health check: verify the server and basic dependency extraction work.
    (StatusCode::OK, "Job Tracker backend (Axum + MongoDB)\n")
}
