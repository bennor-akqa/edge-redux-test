import { systemApi, useGetIPQuery, wrapper } from "@/lib/store";
import "@/styles/globals.css";
import type { AppContext, AppProps } from "next/app";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }: AppProps) {
  const { store } = wrapper.useWrappedStore(pageProps);
  const { data } = useGetIPQuery();
  return (
    <Provider store={store}>
      <div id="ip" hidden>
        {data?.origin}
      </div>
      <Component {...pageProps} />
    </Provider>
  );
}

App.getInitialProps = wrapper.getInitialAppProps(
  (store) => async (_: AppContext) => {
    void store.dispatch<any>(systemApi.endpoints.getIP.initiate());
    return store.dispatch<any>(systemApi.util.getRunningQueriesThunk());
  }
);
