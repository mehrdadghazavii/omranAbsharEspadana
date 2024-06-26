import {Theme} from "..";
import React from "react";

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  // @ts-ignore
  stylisPlugins: [rtlPlugin],
});

function Rtl(props: any) {
    return (
        <Theme>
          <CacheProvider value={cacheRtl}>{props.children}</CacheProvider>
        </Theme>
    );
}

export {Rtl}