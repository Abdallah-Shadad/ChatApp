import * as signalR from '@microsoft/signalr'

let connection = null

export const hub = {
  connect: async (token, handlers) => {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`/chatHub?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('ReceiveMessage', handlers.onMessage)
    connection.on('ReceiveUndeliveredMessages', handlers.onUndelivered)
    connection.on('MessagesRead', handlers.onRead)
    connection.on('UserTyping', handlers.onTyping)

    connection.onreconnecting(() => handlers.onStatus?.('reconnecting'))
    connection.onreconnected(() => handlers.onStatus?.('connected'))
    connection.onclose(() => handlers.onStatus?.('disconnected'))

    await connection.start()
    handlers.onStatus?.('connected')
    return connection
  },

  disconnect: async () => {
    if (connection) {
      await connection.stop()
      connection = null
    }
  },

  sendMessage: (roomId, content) =>
    connection?.invoke('SendMessage', roomId, content),

  markAsRead: (roomId) =>
    connection?.invoke('MarkAsRead', roomId),

  startTyping: (roomId) =>
    connection?.invoke('StartTyping', roomId, true),

  stopTyping: (roomId) =>
    connection?.invoke('StopTyping', roomId),

  getState: () => connection?.state,
}
