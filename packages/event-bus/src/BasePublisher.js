const RabbitMQClient = require('./RabbitMQClient');

/**
 * Base publisher class for publishing events
 */
class BasePublisher {
  constructor(client = null) {
    this.client = client || RabbitMQClient.getInstance();
  }

  /**
   * Publish an event
   * @param {string} eventType - Event type/routing key
   * @param {Object} data - Event data
   * @param {Object} options - Publish options
   * @returns {Promise<string>} Correlation ID
   */
  async publish(eventType, data, options = {}) {
    const channel = await this.client.getChannel();

    const message = {
      event: eventType,
      data,
      metadata: {
        correlationId: options.correlationId || this.generateCorrelationId(),
        timestamp: new Date().toISOString(),
        source: options.source || process.env.SERVICE_NAME || 'unknown',
        version: options.version || '1.0'
      }
    };

    const routingKey = eventType.replace(/\./g, '.');

    channel.publish(
      this.client.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
        correlationId: message.metadata.correlationId,
        timestamp: Date.now(),
        ...options.publishOptions
      }
    );

    console.log(`رویداد منتشر شد: ${eventType}`, { correlationId: message.metadata.correlationId });
    return message.metadata.correlationId;
  }

  /**
   * Publish multiple events
   * @param {Array} events - Array of { eventType, data, options }
   * @returns {Promise<Array<string>>} Array of correlation IDs
   */
  async publishBatch(events) {
    const correlationIds = [];
    for (const event of events) {
      const id = await this.publish(event.eventType, event.data, event.options);
      correlationIds.push(id);
    }
    return correlationIds;
  }

  /**
   * Generate unique correlation ID
   */
  generateCorrelationId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = BasePublisher;
