import React, { useState } from "react";
import {
  Header,
  Icon,
  Form,
  Segment,
  Button,
  Message,
} from "semantic-ui-react";
import { Main } from "@daml.js/airbnb";
import { userContext } from "./App";

type Props = {
  onCreated: () => void;
};

const CreateListingForm: React.FC<Props> = ({ onCreated }) => {
  const party = userContext.useParty();
  const ledger = userContext.useLedger();

  const [propertyName, setPropertyName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [maxGuests, setMaxGuests] = useState("1");
  const [platform, setPlatform] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await ledger.create(Main.Listing, {
        host: party,
        platform: platform || party,
        propertyName,
        location,
        description,
        pricePerNight,
        maxGuests,
      });
      setSuccess(true);
      setTimeout(() => {
        onCreated();
      }, 1200);
    } catch (e: any) {
      setError(e?.message ?? JSON.stringify(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header as="h2" icon>
        <Icon name="plus" />
        Create New Listing
        <Header.Subheader>
          Add a new property listing to the ledger
        </Header.Subheader>
      </Header>

      <Segment>
        {success ? (
          <Message success>
            <Message.Header>Listing Created!</Message.Header>
            <p>Your property listing has been added to the ledger.</p>
          </Message>
        ) : (
          <Form error={!!error}>
            <Form.Input
              label="Property Name"
              placeholder="e.g. Cozy Beach House"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              required
            />
            <Form.Input
              label="Location"
              placeholder="e.g. Malibu, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Form.TextArea
              label="Description"
              placeholder="Describe your property..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Form.Group widths="equal">
              <Form.Input
                label="Price Per Night ($)"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="150.00"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
              />
              <Form.Input
                label="Max Guests"
                type="number"
                min="1"
                placeholder="4"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Input
              label="Platform Party (optional)"
              placeholder="Leave blank to use your own party as platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
            {error && (
              <Message error>
                <Message.Header>Error</Message.Header>
                <p>{error}</p>
              </Message>
            )}
            <Button
              primary
              size="large"
              loading={submitting}
              disabled={
                !propertyName ||
                !location ||
                !description ||
                !pricePerNight ||
                !maxGuests ||
                submitting
              }
              onClick={handleSubmit}
            >
              <Icon name="plus" /> Create Listing
            </Button>
          </Form>
        )}
      </Segment>
    </>
  );
};

export default CreateListingForm;
