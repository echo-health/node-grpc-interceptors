declare module '@pionerlabs/grpc-interceptors' {
  import grpc from 'grpc';

  function serverProxy(server: grpc.Server): ServerProxy;

  export interface Context {
    call: {
      request: any;
      domain?: string;
      metadata: grpc.Metadata;
      cancelled: boolean;
    };
    service: any;
  }

  export interface Client extends grpc.Server {
    interceptors: { (...args: any): any }[];
    use: (
      middlewareFn: ((
        context: Context,
        next: (...args: any) => Promise<void>,
        error: (error: grpc.ServiceError) => void
      ) => void)
    ) => void;
  }

  export interface ServerProxy extends Client {
    intercept: () => IterableIterator<{ fn: (...args: any) => any }>;
  }

  export { serverProxy };
}
