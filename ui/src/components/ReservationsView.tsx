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

const statusColor = (status: string) => {
  switch (status) {
    case "Confirmed":
      return "blue";
    case "CheckedIn":
      return "green";
    case "Completed":
      return "grey";
    case "CancelledByGuest":
    case "CancelledByHost":
      return "red";
    default:
      return "grey";
  }
};

const ReservationsView: React.FC = () => {
  const party = userContext.useParty();
  const ledger = userContext.useLedger();
  const reservations = userContext.useStreamQueries(Main.Reservation);
  const completedStays = userContext.useStreamQueries(Main.CompletedStay);
  const cancelledReservations = userContext.useStreamQueries(Main.CancelledReservation);
  const reviews = userContext.useStreamQueries(Main.Review);

  const handleCheckIn = async (contractId: string) => {
    try {
      await ledger.exercise(Main.Reservation.DoCheckIn, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to check in: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const handleCheckOut = async (contractId: string) => {
    try {
      await ledger.exercise(Main.Reservation.DoCheckOut, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to check out: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const handleCancelByGuest = async (contractId: string) => {
    try {
      await ledger.exercise(Main.Reservation.CancelByGuest, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to cancel: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const handleCancelByHost = async (contractId: string) => {
    try {
      await ledger.exercise(Main.Reservation.CancelByHost, contractId as any, {});
    } catch (e: any) {
      alert(`Failed to cancel: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  const loading = reservations.loading || completedStays.loading || cancelledReservations.loading || reviews.loading;

  if (loading) {
    return <Header as="h3">Loading reservations...</Header>;
  }

  return (
    <>
      {/* Active Reservations */}
      <Header as="h2" icon>
        <Icon name="calendar check" />
        Active Reservations
        <Header.Subheader>
          Confirmed and checked-in reservations
        </Header.Subheader>
      </Header>

      {reservations.contracts.length === 0 ? (
        <Message info>
          <Message.Header>No Active Reservations</Message.Header>
          <p>There are no active reservations at this time.</p>
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
                <Table.HeaderCell>Total</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reservations.contracts.map((c) => {
                const r = c.payload;
                const isGuest = r.guest === party;
                const isHost = r.host === party;
                return (
                  <Table.Row key={c.contractId}>
                    <Table.Cell><strong>{r.propertyName}</strong></Table.Cell>
                    <Table.Cell>{r.location}</Table.Cell>
                    <Table.Cell>{r.guest}</Table.Cell>
                    <Table.Cell>{r.host}</Table.Cell>
                    <Table.Cell>{r.checkIn}</Table.Cell>
                    <Table.Cell>{r.checkOut}</Table.Cell>
                    <Table.Cell>{r.numGuests}</Table.Cell>
                    <Table.Cell><Label color="green">${r.totalPrice}</Label></Table.Cell>
                    <Table.Cell>
                      <Label color={statusColor(r.status)}>{r.status}</Label>
                    </Table.Cell>
                    <Table.Cell>
                      {isGuest && r.status === "Confirmed" && (
                        <Button.Group size="small" vertical>
                          <Button
                            positive
                            icon="sign-in"
                            content="Check In"
                            onClick={() => handleCheckIn(c.contractId)}
                          />
                          <Button
                            color="orange"
                            icon="ban"
                            content="Cancel"
                            onClick={() => handleCancelByGuest(c.contractId)}
                          />
                        </Button.Group>
                      )}
                      {isGuest && r.status === "CheckedIn" && (
                        <Button
                          size="small"
                          color="teal"
                          icon="sign-out"
                          content="Check Out"
                          onClick={() => handleCheckOut(c.contractId)}
                        />
                      )}
                      {isHost && r.status === "Confirmed" && (
                        <Button
                          size="small"
                          color="red"
                          icon="ban"
                          content="Cancel"
                          onClick={() => handleCancelByHost(c.contractId)}
                        />
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Segment>
      )}

      {/* Completed Stays */}
      {completedStays.contracts.length > 0 && (
        <>
          <Header as="h3" style={{ marginTop: 30 }}>
            <Icon name="check circle" />
            Completed Stays
          </Header>
          <Segment style={{ overflowX: "auto" }}>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Property</Table.HeaderCell>
                  <Table.HeaderCell>Location</Table.HeaderCell>
                  <Table.HeaderCell>Guest</Table.HeaderCell>
                  <Table.HeaderCell>Host</Table.HeaderCell>
                  <Table.HeaderCell>Check-in</Table.HeaderCell>
                  <Table.HeaderCell>Check-out</Table.HeaderCell>
                  <Table.HeaderCell>Total Paid</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {completedStays.contracts.map((c) => {
                  const s = c.payload;
                  return (
                    <Table.Row key={c.contractId}>
                      <Table.Cell><strong>{s.propertyName}</strong></Table.Cell>
                      <Table.Cell>{s.location}</Table.Cell>
                      <Table.Cell>{s.guest}</Table.Cell>
                      <Table.Cell>{s.host}</Table.Cell>
                      <Table.Cell>{s.checkIn}</Table.Cell>
                      <Table.Cell>{s.checkOut}</Table.Cell>
                      <Table.Cell><Label color="green">${s.totalPrice}</Label></Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Segment>
        </>
      )}

      {/* Cancelled Reservations */}
      {cancelledReservations.contracts.length > 0 && (
        <>
          <Header as="h3" style={{ marginTop: 30 }}>
            <Icon name="ban" />
            Cancelled Reservations
          </Header>
          <Segment style={{ overflowX: "auto" }}>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Property</Table.HeaderCell>
                  <Table.HeaderCell>Guest</Table.HeaderCell>
                  <Table.HeaderCell>Host</Table.HeaderCell>
                  <Table.HeaderCell>Check-in</Table.HeaderCell>
                  <Table.HeaderCell>Check-out</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>Cancelled By</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {cancelledReservations.contracts.map((c) => {
                  const cr = c.payload;
                  return (
                    <Table.Row key={c.contractId} negative>
                      <Table.Cell><strong>{cr.propertyName}</strong></Table.Cell>
                      <Table.Cell>{cr.guest}</Table.Cell>
                      <Table.Cell>{cr.host}</Table.Cell>
                      <Table.Cell>{cr.checkIn}</Table.Cell>
                      <Table.Cell>{cr.checkOut}</Table.Cell>
                      <Table.Cell>${cr.totalPrice}</Table.Cell>
                      <Table.Cell>
                        <Label color="red">{cr.cancelledBy}</Label>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Segment>
        </>
      )}

      {/* Reviews */}
      {reviews.contracts.length > 0 && (
        <>
          <Header as="h3" style={{ marginTop: 30 }}>
            <Icon name="star" />
            Reviews
          </Header>
          <Segment style={{ overflowX: "auto" }}>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Property</Table.HeaderCell>
                  <Table.HeaderCell>Guest</Table.HeaderCell>
                  <Table.HeaderCell>Rating</Table.HeaderCell>
                  <Table.HeaderCell>Comment</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reviews.contracts.map((c) => {
                  const rv = c.payload;
                  return (
                    <Table.Row key={c.contractId}>
                      <Table.Cell><strong>{rv.propertyName}</strong></Table.Cell>
                      <Table.Cell>{rv.guest}</Table.Cell>
                      <Table.Cell>
                        {Array.from({ length: parseInt(rv.rating) }, (_, i) => (
                          <Icon key={i} name="star" color="yellow" />
                        ))}
                      </Table.Cell>
                      <Table.Cell>{rv.comment}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Segment>
        </>
      )}
    </>
  );
};

export default ReservationsView;
