const amqp = require('amqplib');

/**
 * RabbitMQ client for managing connections and channels
 */
class RabbitMQClient {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.RABBITMQ_HOST || 'localhost',
      port: config.port || process.env.RABBITMQ_PORT || 5672,
      user: config.user || process.env.RABBITMQ_USER || 'guest',
      password: config.password || process.env.RABBITMQ_PASSWORD || 'guest',
      vhost: config.vhost || process.env.RABBITMQ_VHOST || '/'
    };

    this.connection = null;
    this.channel = null;
    this.exchange = config.exchange || 'catering_events';
    this.exchangeType = config.exchangeType || 'topic';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.reconnectDelay = config.reconnectDelay || 5000;
    this.isConnecting = false;
    this.isConnected = false;
  }

  /**
   * Get connection URL
   */
  getConnectionUrl() {
    const { user, password, host, port, vhost } = this.config;
    return `amqp://${user}:${password}@${host}:${port}${vhost}`;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect() {
    if (this.isConnecting) {
      return this.waitForConnection();
    }

    if (this.isConnected && this.channel) {
      return this;
    }

    this.isConnecting = true;

    try {
      const url = this.getConnectionUrl();
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Setup exchange
      await this.channel.assertExchange(this.exchange, this.exchangeType, {
        durable: true
      });

      // Handle connection events
      this.connection.on('error', (err) => {
        console.error('خطای اتصال RabbitMQ:', err.message);
        this.isConnected = false;
        this.handleReconnect();
      });

      this.connection.on('close', () => {
        console.warn('اتصال RabbitMQ بسته شد');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      console.log('اتصال به RabbitMQ برقرار شد');
      return this;
    } catch (error) {
      this.isConnecting = false;
      console.error('خطا در اتصال به RabbitMQ:', error.message);
      await this.handleReconnect();
      throw error;
    }
  }

  /**
   * Wait for connection to be established
   */
  async waitForConnection(timeout = 30000) {
    const startTime = Date.now();
    while (this.isConnecting && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!this.isConnected) {
      throw new Error('اتصال به RabbitMQ برقرار نشد');
    }
    return this;
  }

  /**
   * Handle reconnection
   */
  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('حداکثر تلاش برای اتصال مجدد به RabbitMQ');
      return;
    }

    this.reconnectAttempts++;
    console.log(`تلاش برای اتصال مجدد به RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));

    try {
      await this.connect();
    } catch (error) {
      // Will retry in next iteration
    }
  }

  /**
   * Get channel (ensures connection)
   */
  async getChannel() {
    if (!this.isConnected || !this.channel) {
      await this.connect();
    }
    return this.channel;
  }

  /**
   * Create a queue
   */
  async createQueue(queueName, options = {}) {
    const channel = await this.getChannel();
    return channel.assertQueue(queueName, {
      durable: true,
      ...options
    });
  }

  /**
   * Bind queue to exchange
   */
  async bindQueue(queueName, routingKey) {
    const channel = await this.getChannel();
    await channel.bindQueue(queueName, this.exchange, routingKey);
  }

  /**
   * Close connection
   */
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('اتصال RabbitMQ بسته شد');
    } catch (error) {
      console.error('خطا در بستن اتصال RabbitMQ:', error.message);
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance
 */
RabbitMQClient.getInstance = (config) => {
  if (!instance) {
    instance = new RabbitMQClient(config);
  }
  return instance;
};

module.exports = RabbitMQClient;
