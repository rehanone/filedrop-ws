import { v4 as uuid } from 'uuid';
import randomColor from 'randomcolor';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

const acceptForwardedFor =
  process.env.WS_BEHIND_PROXY === 'true' ||
  process.env.WS_BEHIND_PROXY === 'yes';

export class Client {
  readonly clientId = uuid();
  readonly clientColor = randomColor({ luminosity: 'light' });
  readonly firstSeen = new Date();
  lastSeen = new Date();
  readonly remoteAddress: string;
  networkName: string;

  constructor(private ws: WebSocket, req: IncomingMessage) {
    const address =
      acceptForwardedFor && req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for']
        : req.connection.remoteAddress;
    this.remoteAddress = Array.isArray(address) ? address[0] : address;
  }

  setNetworkName(networkName: string, networkMessage: (name: string) => void) {
    const previousName = this.networkName;
    this.networkName = networkName;

    if (previousName) {
      networkMessage(previousName);
    }

    if (networkName) {
      networkMessage(networkName);
    }
  }

  send(data: string) {
    this.ws.send(data);
  }

  get readyState() {
    return this.ws.readyState;
  }

  close() {
    this.ws.close();
  }
}
