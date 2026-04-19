export {}

declare global {
  interface Window {
    Pi?: {
      init?: (options: { version: string; sandbox: boolean }) => void
      authenticate?: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<any>
      createPayment?: (
        paymentData: {
          amount: number
          memo: string
          metadata: Record<string, unknown>
        },
        callbacks: {
          onReadyForServerApproval: (
            paymentId: string
          ) => void | Promise<void>
          onReadyForServerCompletion: (
            paymentId: string,
            txid: string
          ) => void | Promise<void>
          onCancel: (paymentId?: string) => void
          onError: (error: unknown, payment?: unknown) => void
        }
      ) => void
    }
  }
}
