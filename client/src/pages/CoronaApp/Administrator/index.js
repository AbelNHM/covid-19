import React, { createRef, useContext, useState } from "react";
import { Grid, Avatar, Switch } from "@material-ui/core";
import MaterialTable from "material-table";
import {
  searchUsers,
  findCase,
  activeUser,
  inactiveUser,
  deleteUser,
  addUser
} from "../../../services/adminService";
import { useStyles } from "./styles";
import TimeAgo from "../../../components/ui/TimeAgo";
import { useHistory } from "react-router-dom";
import DateAndTimePicker from "./../../../components/ui/DateAndTimePicker";
import { MapContext } from "../../../contexts/MapContext";
import { NotifierContext } from "../../../contexts/NotifierContext";
import UploadPhoto from "../../../components/ui/UploadPhoto";

const Administrator = () => {
  const tableRef = createRef();
  const classes = useStyles();
  const history = useHistory();
  const { mapPlace } = useContext(MapContext);
  const { setFlash } = useContext(NotifierContext);
  const [profilePic, setProfilePic] = useState();

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

  const handleOnRowClick = async (e, selectedRow) => {
    if (selectedRow.active) {
      const { caseToShow } = await findCase(selectedRow.case);
      history.push("/app", { caseToShow });
    }
  };

  const handleChangeActive = (rowData, table) => {
    if (rowData.active)
      inactiveUser(rowData.id).then(() => table.onQueryChange());
    else activeUser(rowData.id).then(() => table.onQueryChange());
  };

  const handleAddUser = async newData => {
    try {
      const { user } = await addUser({
        ...newData,
        lat: mapPlace.latitude,
        lng: mapPlace.longitude,
        profilePic
      });
      setFlash({
        type: "success",
        message: `New user ${user.fullName} created`
      });
    } catch (error) {
      setFlash({ type: "error", message: error.response.data.message });
    } finally {
      return;
    }
  };

  const handleDeleteUser = async oldData => {
    try {
      const { user } = await deleteUser(oldData.id);
      setFlash({
        type: "success",
        message: `User ${user.fullName} deleted`
      });
    } catch (error) {
      setFlash({ type: "error", message: error.response.data.message });
    } finally {
      return;
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

  return (
    <Grid item sm={6} className={classes.tableWrapper}>
      <MaterialTable
        tableRef={tableRef}
        {...options}
        columns={[
          { field: "id", hidden: true },
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
            editComponent: () => (
              <UploadPhoto {...{ profilePic, setProfilePic }} />
            )
          },
          {
            title: "Name",
            field: "name",
            defaultSort: "asc",
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
            customSort: a => a,
            editable: "never",
            initialEditValue: mapPlace.city
          },
          {
            title: "Country",
            field: "country",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            customSort: a => a,
            editable: "never",
            initialEditValue: mapPlace.country
          },
          {
            title: "Date",
            field: "date",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            render: rowData =>
              rowData.active && <TimeAgo date={new Date(rowData.date)} />,
            editComponent: editProps => <DateAndTimePicker {...{ editProps }} />
          },
          {
            title: "Active",
            field: "active",
            headerStyle: { padding: 5 },
            cellStyle: { padding: 5 },
            render: rowData => (
              <Switch
                checked={rowData.active}
                onChange={() => handleChangeActive(rowData, tableRef.current)}
                onClick={e => e.stopPropagation()}
              />
            ),
            editComponent: props => (
              <Switch
                onChange={() => props.onChange(!props.value)}
                checked={!!props.value}
              ></Switch>
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
              handleAddUser(newData).then(() => {
                setProfilePic(null);
                resolve();
              });
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              handleDeleteUser(oldData).then(() => {
                setProfilePic(null);
                resolve();
              });
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
