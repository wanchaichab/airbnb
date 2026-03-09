import React from "react";
import {
  Header,
  Icon,
  Table,
  Button,
  Label,
  Message,
  Segment,
} from "semantic-ui-react";
import { Main } from "@daml.js/airbnb";
import { userContext } from "./App";

const ReservationRequestsView: React.FC = () => {
  const party = userContext.useParty();
  const ledger = userContext.useLedger();
  const requests = userContext.useStreamQueries(Main.ReservationRequest);

  const handleAccept = async (contractId: string) => {
    try {
      await ledger.exercise(Main.ReservationRequest.Accept, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to accept: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const handleReject = async (contractId: string) => {
    try {
      await ledger.exercise(Main.ReservationRequest.Reject, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to reject: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const handleWithdraw = async (contractId: string) => {
    try {
      await ledger.exercise(Main.ReservationRequest.Withdraw, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to withdraw: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  if (requests.loading) {
    return <Header as="h3">Loading requests...</Header>;
  }

  return (
    <>
      <Header as="h2" icon>
        <Icon name="inbox" />
        Reservation Requests
        <Header.Subheader>
          Pending reservation requests (proposals awaiting host decision)
        </Header.Subheader>
      </Header>

      {requests.contracts.length === 0 ? (
        <Message info>
          <Message.Header>No Pending Requests</Message.Header>
          <p>There are no reservation requests at this time.</p>
        </Message>
      ) : (
        <Segment style={{ overflowX: "auto" }}>
          <Table celled striped selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Property</Table.HeaderCell>
                <Table.HeaderCell>Location</Table.HeaderCell>
                <Table.HeaderCell>Guest</Table.HeaderCell>
                <Table.HeaderCell>Host</Table.HeaderCell>
                <Table.HeaderCell>Check-in</Table.HeaderCell>
                <Table.HeaderCell>Check-out</Table.HeaderCell>
                <Table.HeaderCell>Guests</Table.HeaderCell>
                <Table.HeaderCell>Total Price</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.contracts.map((c) => {
                const r = c.payload;
                const isHost = r.host === party;
                const isGuest = r.guest === party;
                return (
                  <Table.Row key={c.contractId}>
                    <Table.Cell>
                      <strong>{r.propertyName}</strong>
                    </Table.Cell>
                    <Table.Cell>{r.location}</Table.Cell>
                    <Table.Cell>
                      <Label size="small" basic color={isGuest ? "blue" : undefined}>
                        {r.guest}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label size="small" basic color={isHost ? "teal" : undefined}>
                        {r.host}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>{r.checkIn}</Table.Cell>
                    <Table.Cell>{r.checkOut}</Table.Cell>
                    <Table.Cell>{r.numGuests}</Table.Cell>
                    <Table.Cell>
                      <Label color="green">${r.totalPrice}</Label>
                    </Table.Cell>
                    <Table.Cell>
                      {isHost && (
                        <Button.Group size="small">
                          <Button
                            positive
                            icon="check"
                            content="Accept"
                            onClick={() => handleAccept(c.contractId)}
                          />
                          <Button
                            negative
                            icon="times"
                            content="Reject"
                            onClick={() => handleReject(c.contractId)}
                          />
                        </Button.Group>
                      )}
                      {isGuest && (
                        <Button
                          size="small"
                          color="orange"
                          icon="undo"
                          content="Withdraw"
                          onClick={() => handleWithdraw(c.contractId)}
                        />
                      )}
                      {!isHost && !isGuest && (
                        <Label basic size="small">
                          Observer
                        </Label>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Segment>
      )}
    </>
  );
};

export default ReservationRequestsView;
