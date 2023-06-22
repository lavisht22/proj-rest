FROM osgeo/proj

# Install system dependencies
RUN apt-get update && apt-get install -y curl

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE 8081

# Run the app
CMD [ "npm", "start" ]