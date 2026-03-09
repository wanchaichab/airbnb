import React, { useState } from "react";
import {
  Card,
  Header,
  Icon,
  Label,
  Button,
  Modal,
  Form,
  Message,
} from "semantic-ui-react";
import { Main } from "@daml.js/airbnb";
import { userContext } from "./App";

const ListingsView: React.FC = () => {
  const party = userContext.useParty();
  const ledger = userContext.useLedger();
  const listings = userContext.useStreamQueries(Main.Listing);

  // Modal state for booking
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<{
    contractId: string;
    payload: Main.Listing;
  } | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const openBooking = (contractId: string, payload: Main.Listing) => {
    setSelectedListing({ contractId, payload });
    setCheckIn("");
    setCheckOut("");
    setNumGuests("1");
    setError(undefined);
    setSuccess(false);
    setBookingOpen(true);
  };

  const handleBook = async () => {
    if (!selectedListing) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await ledger.exercise(
        Main.Listing.RequestReservation,
        selectedListing.contractId as any,
        {
          guest: party,
          checkIn: checkIn,
          checkOut: checkOut,
          numGuests: numGuests,
        }
      );
      setSuccess(true);
      setTimeout(() => setBookingOpen(false), 1200);
    } catch (e: any) {
      setError(e?.message ?? JSON.stringify(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveListing = async (contractId: string) => {
    try {
      await ledger.exercise(
        Main.Listing.RemoveListing,
        contractId as any,
        {}
      );
    } catch (e: any) {
      alert(`Failed to remove listing: ${e?.message ?? JSON.stringify(e)}`);
    }
  };

  if (listings.loading) {
    return <Header as="h3">Loading listings...</Header>;
  }

  if (listings.contracts.length === 0) {
    return (
      <Message info>
        <Message.Header>No Listings Found</Message.Header>
        <p>
          There are no property listings on the ledger yet. Use the "Create
          Listing" tab to add one.
        </p>
      </Message>
    );
  }

  return (
    <>
      <Header as="h2" icon>
        <Icon name="home" />
        Property Listings
        <Header.Subheader>
          Browse available properties and request a reservation
        </Header.Subheader>
      </Header>

      <Card.Group itemsPerRow={3} stackable>
        {listings.contracts.map((c) => {
          const l = c.payload;
          const isHost = l.host === party;
          return (
            <Card key={c.contractId} raised>
              <Card.Content>
                <Card.Header>{l.propertyName}</Card.Header>
                <Card.Meta>
                  <Icon name="map marker alternate" /> {l.location}
                </Card.Meta>
                <Card.Description>{l.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Label color="green" size="large">
                  <Icon name="dollar sign" />${l.pricePerNight} / night
                </Label>
                <Label color="blue">
                  <Icon name="users" /> Max {l.maxGuests} guests
                </Label>
              </Card.Content>
              <Card.Content extra>
                <Label size="small" basic>
                  Host: {l.host}
                </Label>
              </Card.Content>
              <Card.Content extra>
                {!isHost && (
                  <Button
                    primary
                    fluid
                    icon="calendar plus"
                    content="Request Reservation"
                    onClick={() => openBooking(c.contractId, l)}
                  />
                )}
                {isHost && (
                  <Button.Group fluid>
                    <Button
                      color="red"
                      icon="trash"
                      content="Remove"
                      onClick={() => handleRemoveListing(c.contractId)}
                    />
                  </Button.Group>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>

      {/* Booking Modal */}
      <Modal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        size="small"
        closeIcon
      >
        <Modal.Header>
          <Icon name="calendar plus" /> Request Reservation
          {selectedListing && ` - ${selectedListing.payload.propertyName}`}
        </Modal.Header>
        <Modal.Content>
          {success ? (
            <Message success>
              <Message.Header>Reservation Requested!</Message.Header>
              <p>Your request has been submitted to the host.</p>
            </Message>
          ) : (
            <Form error={!!error}>
              <Form.Input
                label="Check-in Date"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
              <Form.Input
                label="Check-out Date"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
              <Form.Input
                label="Number of Guests"
                type="number"
                min={1}
                max={selectedListing?.payload.maxGuests ?? 10}
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                required
              />
              {selectedListing && checkIn && checkOut && checkOut > checkIn && (
                <Message info>
                  <p>
                    <strong>Estimated Total: </strong>$
                    {(
                      parseFloat(selectedListing.payload.pricePerNight) *
                      Math.ceil(
                        (new Date(checkOut).getTime() -
                          new Date(checkIn).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    ).toFixed(2)}{" "}
                    for{" "}
                    {Math.ceil(
                      (new Date(checkOut).getTime() -
                        new Date(checkIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    night(s)
                  </p>
                </Message>
              )}
              {error && (
                <Message error>
                  <Message.Header>Error</Message.Header>
                  <p>{error}</p>
                </Message>
              )}
            </Form>
          )}
        </Modal.Content>
        {!success && (
          <Modal.Actions>
            <Button onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button
              primary
              loading={submitting}
              disabled={!checkIn || !checkOut || !numGuests || submitting}
              onClick={handleBook}
            >
              Submit Request
            </Button>
          </Modal.Actions>
        )}
      </Modal>
    </>
  );
};

export default ListingsView;
