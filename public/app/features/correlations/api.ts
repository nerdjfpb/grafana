import { Correlation } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { AddCorrelationResponse } from './types';

export const addCorrelation = (sourceUid: string, correlation: Correlation) => {
  return getBackendSrv().fetch<AddCorrelationResponse>({
    url: `/api/datasources/${sourceUid}/correlations`,
    method: 'POST',
    data: { targetUid: correlation.target },
  });
};

export const deleteCorrelation = (sourceUid: string, targetUid: string) => {
  return getBackendSrv().fetch<AddCorrelationResponse>({
    url: `/api/datasources/${sourceUid}/correlations/${targetUid}`,
    method: 'DELETE',
  });
};
