const mqtt = require('mqtt');
const config = require('../../config');
const prisma = require('../../utils/prisma');

let client = null;

/**
 * Connect to MQTT broker and subscribe to IoT topics
 * @param {Function} iotService - IoT service for processing sensor data
 */
const connect = (iotService) => {
  if (!config.MQTT_BROKER_URL) {
    console.warn('MQTT_BROKER_URL not configured. IoT integration disabled.');
    return;
  }

  const options = {
    clientId: `aims_mqtt_${Date.now()}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000
  };

  if (config.MQTT_USERNAME && config.MQTT_PASSWORD) {
    options.username = config.MQTT_USERNAME;
    options.password = config.MQTT_PASSWORD;
  }

  client = mqtt.connect(config.MQTT_BROKER_URL, options);

  client.on('connect', () => {
    console.log('✓ Connected to MQTT broker:', config.MQTT_BROKER_URL);

    // Subscribe to IoT sensor topics
    const topics = [
      'aims/iot/temperature/+',
      'aims/iot/humidity/+',
      'aims/iot/coldchain/+',
      'aims/iot/sensor/+'
    ];

    topics.forEach(topic => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err.message);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`MQTT Message received on ${topic}:`, payload);

      // Process the sensor reading
      if (iotService) {
        await iotService.processSensorReading({
          topic,
          ...payload
        });
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  client.on('error', (error) => {
    console.error('MQTT connection error:', error);
  });

  client.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
  });

  client.on('close', () => {
    console.log('MQTT connection closed');
  });
};

/**
 * Publish a message to an MQTT topic
 * @param {string} topic - MQTT topic
 * @param {Object} data - Data to publish
 * @returns {Promise<void>}
 */
const publish = (topic, data) => {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      return reject(new Error('MQTT client not connected'));
    }

    const message = JSON.stringify(data);
    client.publish(topic, message, { qos: 1 }, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`Published to ${topic}:`, message);
        resolve();
      }
    });
  });
};

/**
 * Disconnect from MQTT broker
 */
const disconnect = async () => {
  if (client) {
    return new Promise((resolve) => {
      client.end(false, () => {
        console.log('Disconnected from MQTT broker');
        resolve();
      });
    });
  }
};

module.exports = {
  connect,
  publish,
  disconnect
};
