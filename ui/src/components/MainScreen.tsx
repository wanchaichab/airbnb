import React, { useState } from "react";
import { Menu, Image, Container } from "semantic-ui-react";
import { userContext } from "./App";
import ListingsView from "./ListingsView";
import ReservationRequestsView from "./ReservationRequestsView";
import ReservationsView from "./ReservationsView";
import CreateListingForm from "./CreateListingForm";

type Tab = "listings" | "requests" | "reservations" | "create";

type Props = {
  onDisconnect: () => void;
};

const MainScreen: React.FC<Props> = ({ onDisconnect }) => {
  const party = userContext.useParty();
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  return (
    <>
      <Menu inverted color="blue" size="large" stackable>
        <Menu.Item header>
          <Image
            src="/daml.svg"
            alt="Daml Logo"
            size="mini"
            style={{ marginRight: 10, filter: "brightness(0) invert(1)" }}
          />
          AirBnb Reservations
        </Menu.Item>
        <Menu.Item
          name="Listings"
          active={activeTab === "listings"}
          onClick={() => setActiveTab("listings")}
          icon="home"
        />
        <Menu.Item
          name="Requests"
          active={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
          icon="inbox"
        />
        <Menu.Item
          name="Reservations"
          active={activeTab === "reservations"}
          onClick={() => setActiveTab("reservations")}
          icon="calendar check"
        />
        <Menu.Item
          name="Create Listing"
          active={activeTab === "create"}
          onClick={() => setActiveTab("create")}
          icon="plus"
        />
        <Menu.Menu position="right">
          <Menu.Item>
            Acting as: <strong style={{ marginLeft: 5 }}>{party}</strong>
          </Menu.Item>
          <Menu.Item
            icon="sign-out"
            content="Disconnect"
            onClick={onDisconnect}
          />
        </Menu.Menu>
      </Menu>

      <Container style={{ marginTop: 20, paddingBottom: 40 }}>
        {activeTab === "listings" && <ListingsView />}
        {activeTab === "requests" && <ReservationRequestsView />}
        {activeTab === "reservations" && <ReservationsView />}
        {activeTab === "create" && (
          <CreateListingForm onCreated={() => setActiveTab("listings")} />
        )}
      </Container>
    </>
  );
};

export default MainScreen;
