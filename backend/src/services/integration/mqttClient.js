const mqtt = require('mqtt');
const config = require('../../config');
const iotService = require('../modules/iot/iot.service');

/**
 * MQTT Client Service
 * Connects to MQTT broker and subscribes to IoT sensor topics
 * Forwards incoming readings to iot.service for processing (FR-012, FR-016)
 */
class MqttClientService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.topics = [
      'aims/sensors/temperature/+',
      'aims/sensors/humidity/+',
      'aims/sensors/#',
    ];
  }

  /**
   * Connect to MQTT broker
   */
  connect() {
    if (!config.MQTT_BROKER_URL) {
      console.warn('MQTT_BROKER_URL not configured. IoT sensor ingestion disabled.');
      return;
    }

    const options = {
      clientId: `aims_backend_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };

    if (config.MQTT_USERNAME && config.MQTT_PASSWORD) {
      options.username = config.MQTT_USERNAME;
      options.password = config.MQTT_PASSWORD;
    }

    try {
      this.client = mqtt.connect(config.MQTT_BROKER_URL, options);

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker:', config.MQTT_BROKER_URL);
        this.connected = true;
        
        // Subscribe to sensor topics
        this.subscribeToTopics();
      });

      this.client.on('message', async (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          await this.handleMessage(topic, payload);
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      });

      this.client.on('error', (error) => {
        console.error('MQTT client error:', error);
        this.connected = false;
      });

      this.client.on('close', () => {
        console.log('MQTT connection closed');
        this.connected = false;
      });

      this.client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
      });

    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
    }
  }

  /**
   * Subscribe to IoT sensor topics
   */
  subscribeToTopics() {
    if (!this.client || !this.connected) return;

    this.topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT message
   * @param {string} topic - MQTT topic
   * @param {Object} payload - Message payload
   */
  async handleMessage(topic, payload) {
    // Parse topic to extract sensor type and ID
    // Example: aims/sensors/temperature/sensor-001
    const parts = topic.split('/');
    
    if (parts.length < 4) {
      console.warn('Invalid topic format:', topic);
      return;
    }

    const sensorType = parts[2]; // temperature, humidity, etc.
    const sensorId = parts[3];   // sensor identifier

    // Validate payload
    if (!payload || typeof payload.value === 'undefined') {
      console.warn('Invalid payload for topic', topic, payload);
      return;
    }

    // Process the reading through iot.service
    try {
      await iotService.processSensorReading({
        sensorId,
        sensorType,
        value: payload.value,
        unit: payload.unit || this.getDefaultUnit(sensorType),
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        quality: payload.quality,
      });
    } catch (error) {
      console.error('Error processing sensor reading:', error);
    }
  }

  /**
   * Get default unit for sensor type
   * @param {string} sensorType - Sensor type
   * @returns {string} - Default unit
   */
  getDefaultUnit(sensorType) {
    const units = {
      temperature: 'CELSIUS',
      humidity: 'PERCENT',
      pressure: 'PASCAL',
      co2: 'PPM',
    };
    return units[sensorType] || 'UNKNOWN';
  }

  /**
   * Publish message to MQTT topic
   * @param {string} topic - Topic to publish to
   * @param {Object} message - Message payload
   */
  publish(topic, message) {
    if (!this.client || !this.connected) {
      console.warn('Cannot publish: MQTT client not connected');
      return;
    }

    const payload = JSON.stringify(message);
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
      } else {
        console.log(`Published to ${topic}:`, payload);
      }
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    if (this.client) {
      this.client.end(true, () => {
        console.log('Disconnected from MQTT broker');
        this.connected = false;
      });
    }
  }
}

module.exports = new MqttClientService();
