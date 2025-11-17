// MongoDB helper utilities: create client and simple helpers.

use mongodb::{Client, options::ClientOptions};

/// Create a MongoDB client from a URI. We keep it simple for learning.
pub async fn create_client(uri: &str) -> anyhow::Result<Client> {
    // parse options from the connection string (this is async-friendly)
    let mut client_options = ClientOptions::parse(uri).await?;
    // set a sensible app name to help identify connections in monitoring tools
    client_options.app_name = Some("job-tracker-backend".to_string());
    let client = Client::with_options(client_options)?;
    Ok(client)
}

/// Ping the server to verify connectivity (useful in startup)
pub async fn ping(client: &Client) -> anyhow::Result<()> {
    client
        .database("admin")
        .run_command(mongodb::bson::doc! { "ping": 1 }, None)
        .await?;
    tracing::info!("MongoDB ping successful");
    Ok(())
}

// Small helper to get the jobs collection. We centralize the DB name/collection name here.
pub fn jobs_collection(client: &Client) -> mongodb::Collection<mongodb::bson::Document> {
    client.database("job_tracker").collection("jobs")
}
