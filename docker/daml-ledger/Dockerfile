FROM digitalasset/daml-sdk:2.10.2

# The project's daml.yaml uses sdk-version 2.10.3 but the Docker image
# only goes up to 2.10.2. We patch daml.yaml at build time so that
# `daml build` and `daml start` do not complain about a version mismatch.

WORKDIR /app

# Copy DAML source and config
COPY daml.yaml daml.yaml
COPY daml/ daml/

# Patch the SDK version to match the Docker image
RUN sed -i 's/sdk-version: 2.10.3/sdk-version: 2.10.2/' daml.yaml

# Build the DAR file
RUN daml build

# Expose sandbox (6865) and JSON API (7575) ports
EXPOSE 6865 7575

# Start sandbox + JSON API via `daml start`
# --open-browser=no prevents it from trying to open a browser
# The sandbox listens on 0.0.0.0 so it's reachable from other containers
CMD ["daml", "start", "--open-browser=no", \
     "--sandbox-option", "-C", \
     "--sandbox-option", "canton.participants.sandbox.ledger-api.address=0.0.0.0", \
     "--json-api-option", "--address", \
     "--json-api-option", "0.0.0.0"]

