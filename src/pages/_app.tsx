import { AppState, IPState, systemApi, useGetIPQuery, wrapper } from "@/lib/store";
import "@/styles/globals.css";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import { Provider } from "react-redux";

export default function CustomApp({ Component, pageProps }: AppProps) {
  const { store } = wrapper.useWrappedStore(pageProps);
  return (
    <Provider store={store}>
      <IPLogger />
      <Component {...pageProps} />
    </Provider>
  );
}

CustomApp.getInitialProps = wrapper.getInitialAppProps(
  (store) => async (context: AppContext) => {
    store.dispatch<any>(systemApi.endpoints.getIP.initiate());
    await Promise.all(store.dispatch<any>(systemApi.util.getRunningQueriesThunk()));
    
    return {
      pageProps: {
        ...(await App.getInitialProps(context)).pageProps,
        foo: 'bar'
      }
    }
  }
);

function IPLogger() {
  const { data } = useGetIPQuery();
  const origin = data?.origin
  return (
    <div id="ip" hidden>
      {origin ?? "unknown"}
    </div>
  );
}
