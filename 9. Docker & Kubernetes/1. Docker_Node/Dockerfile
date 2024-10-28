FROM ubuntu


RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# COPY package*.json /app/package*.json
# COPY package*.json .


COPY . .
RUN cd app && npm i

COPY server.js /app/server.js



ENTRYPOINT [ "node", "app/server.js" ]

# instead of writing app everywhere write WORKDIR /app