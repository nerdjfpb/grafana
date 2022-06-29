import { css } from '@emotion/css';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { CellProps, SortByFn } from 'react-table';

import { DataSourceInstanceSettings, GrafanaTheme2 } from '@grafana/data';
import { AnotherTable, Button, DeleteButton, HorizontalGroup, useStyles2 } from '@grafana/ui';
import { Column } from '@grafana/ui/src/components/AnotherTable';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import Page from 'app/core/components/Page/Page';

import { useNavModel } from '../../core/hooks/useNavModel';

import { AddCorrelationForm } from './AddCorrelationForm';
import { CorrelationDetailsFormPart } from './CorrelationDetailsFormPart';
import { useCorrelations } from './useCorrelations';

const styles = {
  table: css`
    width: 100%;
  `,
};

interface TableData {
  source: DataSourceInstanceSettings;
  target: DataSourceInstanceSettings;
  label?: string;
  description?: string;
}

const sortDatasource: SortByFn<DataSourceInstanceSettings> = (a, b, column) =>
  a.values[column].name.localeCompare(b.values[column].name);

export default function CorrelationsPage() {
  const navModel = useNavModel('correlations');
  const [isAdding, setIsAdding] = useState(false);
  const { correlations, add, remove } = useCorrelations();

  console.log(correlations)

  const RowActions = useCallback(
    ({
      row: {
        original: { source, target },
      },
    }: CellProps<TableData, void>) => <DeleteButton onConfirm={() => remove(source.uid, target.uid)} />,
    [remove]
  );

  const columns = useMemo<Column[]>(
    () => [
      {
        id: 'source',
        header: 'Source',
        cell: DataSourceCell,
        sortType: sortDatasource,
      },
      {
        id: 'target',
        header: 'Target',
        cell: DataSourceCell,
        sortType: sortDatasource,
      },
      { id: 'label', header: 'Label', sortType: 'alphanumeric' },
      { id: 'actions', cell: RowActions, shrink: true },
    ],
    [RowActions]
  );

  const data = useMemo(
    () =>
      correlations,
    [correlations]
  );

  return (
    <>
      <Page navModel={navModel}>
        <Page.Contents>
          {correlations.length === 0 && !isAdding && (
            <EmptyListCTA
              title="You haven't defined any correlation yet."
              buttonIcon="sitemap"
              onClick={() => setIsAdding(true)}
              buttonTitle="Add correlation"
            />
          )}

          {correlations.length >= 1 && (
            <div>
              <HorizontalGroup justify="space-between">
                <div>
                  <h4>Correlations</h4>
                  <p>description</p>
                </div>
                <Button icon="plus" onClick={() => setIsAdding(true)} disabled={isAdding}>
                  Add new
                </Button>
              </HorizontalGroup>
            </div>
          )}

          {isAdding && <AddCorrelationForm onClose={() => setIsAdding(false)} onSubmit={add} />}

          {correlations.length >= 1 && (
            <AnotherTable
              renderExpandedRow={(row) => <CorrelationDetailsFormPart />}
              columns={columns}
              data={data}
              className={styles.table}
              expandable
            />
          )}
        </Page.Contents>
      </Page>
    </>
  );
}

const getDatasourceCellStyles = (theme: GrafanaTheme2) => ({
  root: css`
    display: flex;
    align-items: center;
  `,
  dsLogo: css`
    margin-right: ${theme.spacing()};
    height: 16px;
    width: 16px;
  `,
});

const DataSourceCell = memo(
  function DataSourceCell({ cell: { value } }: CellProps<TableData, TableData['source'] | TableData['target']>) {
    const styles = useStyles2(getDatasourceCellStyles);

    return (
      <span className={styles.root}>
        <img src={value.meta.info.logos.small} className={styles.dsLogo} />
        {value.name}
      </span>
    );
  },
  ({ cell: { value } }, { cell: { value: prevValue } }) => {
    return value.type === prevValue.type && value.name === prevValue.name;
  }
);
