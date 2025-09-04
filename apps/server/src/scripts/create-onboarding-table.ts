import { Client } from "pg";

const createTableQuery = `
CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_data JSONB NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const createOnboardingTable = async () => {
  const connectionString = process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      "POSTGRES_CONNECTION_STRING is not set in the environment variables."
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to the database.");

    await client.query(createTableQuery);
    console.log('Successfully created the "onboarding_sessions" table.');
  } catch (err) {
    console.error("Error creating the table:", err);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Disconnected from the database.");
  }
};

createOnboardingTable();
