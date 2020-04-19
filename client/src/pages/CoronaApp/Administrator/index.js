import React, { createRef } from "react";
import { Grid, Avatar, Switch } from "@material-ui/core";
import MaterialTable from "material-table";
import { searchUsers, findCase } from "../../../services/adminService";
import { useStyles } from "./styles";
import TimeAgo from "../../../components/ui/TimeAgo";
import { useHistory } from "react-router-dom";

const Administrator = () => {
  const tableRef = createRef();
  const classes = useStyles();
  const history = useHistory();

  const handleUpdateData = async query => {
    const { pageSize, page, search, orderBy, orderDirection } = query;
    try {
      const res = await searchUsers(
        pageSize,
        page,
        search,
        orderBy,
        orderDirection
      );
      return res;
    } catch (error) {
      console.log(error.message);
    }
  };

  const options = {
    style: { borderRadius: 0 },
    localization: { header: { actions: "" } },
    options: {
      pageSize: 20,
      pageSizeOptions: [],
      showTitle: false,
      actionsColumnIndex: 7,
      draggable: false,
      addRowPosition: "first"
    }
  };

  const handleOnRowClick = async (e, selectedRow) => {
    const { caseToShow } = await findCase(selectedRow.case);
    history.push("/app", { caseToShow });
  };

  const handleChangeActive = e => e.preventDefault();

  return (
    <Grid item lg={6} className={classes.tableWrapper}>
      <MaterialTable
        tableRef={tableRef}
        {...options}
        columns={[
          {
            field: "image",
            width: 1,
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            render: rowData => (
              <Avatar
                alt={rowData.name}
                src={rowData.image}
                className={classes.image}
              />
            ),
            editComponent: () => <Avatar className={classes.image} />
          },
          {
            title: "Name",
            field: "name",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            customSort: a => a
          },
          {
            title: "Surname",
            field: "surname",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            customSort: a => a
          },
          {
            title: "City",
            field: "city",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            customSort: a => a
          },
          {
            title: "Country",
            field: "country",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            customSort: a => a
          },
          {
            title: "Date",
            field: "date",
            defaultSort: "desc",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            render: rowData =>
              rowData.active && <TimeAgo date={new Date(rowData.date)} />
          },
          {
            title: "Active",
            field: "active",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            render: rowData => (
              <Switch checked={rowData.active} onChange={handleChangeActive} />
            )
          }
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            handleUpdateData(query).then(res =>
              resolve({
                data: res.users,
                page: res.page,
                totalCount: res.count
              })
            );
          })
        }
        editable={{
          onRowAdd: newData =>
            new Promise(resolve => {
              console.log(newData);
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              console.log(newData, oldData);
              resolve();
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              console.log(oldData);
              resolve();
            })
        }}
        actions={[
          {
            icon: "refresh",
            tooltip: "Refresh data",
            isFreeAction: true,
            onClick: () => tableRef.current && tableRef.current.onQueryChange()
          }
        ]}
        onRowClick={handleOnRowClick}
      />
    </Grid>
  );
};

export default Administrator;
