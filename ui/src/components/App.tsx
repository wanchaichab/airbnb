import React, { useCallback, useEffect, useState } from "react";
import { createLedgerContext } from "@daml/react";
import Ledger from "@daml/ledger";
import { makeToken } from "../config";
import MainScreen from "./MainScreen";
import {
  Grid,
  Header,
  Segment,
  Form,
  Button,
  Message,
  Image,
} from "semantic-ui-react";

export const userContext = createLedgerContext();

/**
 * Minimal connect screen — just type your sandbox username and go.
 * No password, no auth provider. Works with `daml start` local sandbox.
 */
const ConnectScreen: React.FC<{
  onConnect: (token: string, party: string, userId: string) => void;
}> = ({ onConnect }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleConnect = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!username.trim()) return;
      setLoading(true);
      setError(undefined);
      try {
        const token = makeToken(username.trim());
        const ledger = new Ledger({ token });
        const user = await ledger.getUser();
        const primaryParty = user.primaryParty;
        if (!primaryParty) {
          setError(
            `User '${username}' exists but has no primary party assigned.`,
          );
          return;
        }
        onConnect(token, primaryParty, username.trim());
      } catch (err: any) {
        const msg = err?.message ?? JSON.stringify(err);
        if (msg.includes("USER_NOT_FOUND")) {
          setError(
            `User '${username}' not found on the ledger. Make sure you have run 'daml start' and that this user was allocated (e.g. via an init-script in daml.yaml).`,
          );
        } else if (
          msg.includes("ECONNREFUSED") ||
          msg.includes("Failed to fetch")
        ) {
          setError(
            "Cannot connect to the ledger. Make sure 'daml start' is running (JSON API on port 7575).",
          );
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [username, onConnect],
  );

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" textAlign="center" color="blue">
          <Image
            src="/daml.svg"
            alt="Daml Logo"
            spaced
            size="small"
            verticalAlign="bottom"
          />
          <Header.Content>
            AirBnb Reservations
            <Header.Subheader>
              Enter your sandbox username to connect (alice_host, bob_guest,
              airbnb_platform).
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Form size="large" onSubmit={handleConnect} error={!!error}>
          <Segment>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Sandbox username (e.g. alice)"
              value={username}
              onChange={(_, { value }) => setUsername(value)}
              disabled={loading}
            />
            <Button
              primary
              fluid
              size="large"
              loading={loading}
              disabled={!username.trim() || loading}
              type="submit"
            >
              Connect
            </Button>
            {error && (
              <Message error style={{ textAlign: "left" }}>
                <Message.Header>Connection Failed</Message.Header>
                <p>{error}</p>
              </Message>
            )}
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<{
    token: string;
    party: string;
    userId: string;
  } | null>(null);

  const handleConnect = useCallback(
    (token: string, party: string, userId: string) => {
      setSession({ token, party, userId });
    },
    [],
  );

  if (!session) {
    return <ConnectScreen onConnect={handleConnect} />;
  }

  return (
    <userContext.DamlLedger
      token={session.token}
      party={session.party}
      user={{ userId: session.userId, primaryParty: session.party }}
    >
      <MainScreen onDisconnect={() => setSession(null)} />
    </userContext.DamlLedger>
  );
};

export default App;
