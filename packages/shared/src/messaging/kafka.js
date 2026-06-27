import { Kafka, logLevel } from 'kafkajs';
import { config } from '../config/env.js';

export const TOPICS = {
  LOGS: 'logs-topic',
  INCIDENT_CREATED: 'incident-created',
  INCIDENT_UPDATED: 'incident-updated',
  INCIDENT_RESOLVED: 'incident-resolved',
  ALERT: 'alert-topic',
  AI_ANALYSIS: 'ai-analysis-topic',
};

class KafkaClient {
  static #instance = null;
  #kafka = null;
  #producer = null;

  constructor() {
    if (KafkaClient.#instance) {
      return KafkaClient.#instance;
    }
    KafkaClient.#instance = this;
  }

  getKafka() {
    if (!this.#kafka) {
      this.#kafka = new Kafka({
        clientId: 'intelliops',
        brokers: config.kafkaBrokers,
        logLevel: logLevel.ERROR,
        retry: { initialRetryTime: 300, retries: 5 },
      });
    }
    return this.#kafka;
  }

  async getProducer() {
    if (!this.#producer) {
      this.#producer = this.getKafka().producer();
      await this.#producer.connect();
    }
    return this.#producer;
  }

  createConsumer(groupId) {
    return this.getKafka().consumer({ groupId });
  }

  async disconnect() {
    if (this.#producer) {
      await this.#producer.disconnect();
      this.#producer = null;
    }
  }
}

export const kafkaClient = new KafkaClient();
export default kafkaClient;
