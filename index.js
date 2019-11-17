"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFirestore = void 0;

var _react = require("react");

function dataResponse(data = null, code = 200) {
  let message = "Unknown error!";
  let status = "ERROR";

  switch (code) {
    case 200:
      message = "The request has succeeded.";
      status = "OK";
      console.log("data", data);
      break;

    case 400:
      message = "The server could not understand the request due to invalid syntax.";
      status = "Bad Request";
      break;

    case 404:
      message = "The server can not find requested resource.";
      status = "Not Found";
      break;

    case 500:
      message = "The server has encountered a situation it doesn't know how to handle.";
      status = "Internal Server Error";
      break;

    default:
  }

  return {
    code,
    data,
    message,
    status
  };
}

function getWhere(where) {
  const queries = where.split(" ");
  queries[0] = queries[0].replace("?", "");

  if (!isNaN(queries[2])) {
    queries[2] = +queries[2];
  }

  console.log("queries", queries);
  if (queries.length === 3) return queries;
  throw "un-support operation!";
}

function mapQuerySnapshotToData(querySnapshot, onCompleted) {
  const mappedData = [];
  querySnapshot.forEach(doc => {
    const docData = doc.data();
    console.log("id =>", doc.id);
    mappedData.push({ ...docData,
      id: doc.id,
      key: doc.id
    });
  });
  return onCompleted(mappedData);
}

const useFirestore = (firestore, path = null, options) => {
  const [data, setData] = (0, _react.useState)(null);

  async function createDoc(createData, createPath) {
    if (!createData || !path && !createPath) return dataResponse(null, 400); // Bad request

    if (createData) createData.timestamp = FieldValue.serverTimestamp();
    const colRef = firestore.collection(createPath || path);

    try {
      const docRef = await colRef.add(createData);
      const createdDoc = await docRef.get();
      console.log("createdDoc", createdDoc);
      if (!createdDoc.exists) return dataResponse(null, 404);
      return dataResponse(createdDoc.data(), 200);
    } catch (error) {
      console.log("createDoc", error);
      return dataResponse(error, 500);
    }
  }

  async function deleteDoc(docId, deletePath) {
    if (!docId || !path && !deletePath) return dataResponse(null, 400); // Bad request

    const docRef = firestore.collection(deletePath || path).doc(docId);

    try {
      await docRef.delete();
      const deletedDoc = await docRef.get();
      console.log("deleteDoc", deletedDoc);
      if (deletedDoc.exists) return dataResponse(deletedDoc.data(), 404);
      return dataResponse(null, 200);
    } catch (error) {
      console.log("deleteDoc", error);
      return dataResponse(error, 500);
    }
  }

  async function readDoc(options, readPath) {
    if (!path && !readPath) return dataResponse(null, 400); // Bad request

    if (options && typeof options === "string" && options.startsWith("?")) {
      const colRef = firestore.collection(readPath || path);
      console.log("options", options);

      try {
        const wheres = getWhere(options);
        const querySnapshot = await colRef.where(wheres[0], wheres[1], wheres[2]).get();
        return mapQuerySnapshotToData(querySnapshot, mappedData => {
          console.log("readDoc collection with selector", mappedData);
          return dataResponse(mappedData, 200);
        });
      } catch (error) {
        console.log("readDoc collection with selector", error);
      }
    }

    if (options && typeof options === "string") {
      const docRef = firestore.collection(readPath || path).doc(options);

      try {
        const readDoc = await docRef.get();
        console.log("readDoc by docId", readDoc);
        if (!readDoc.exists) return dataResponse(null, 404);
        return dataResponse(readDoc.data(), 200);
      } catch (error) {
        console.log("readDoc document", error);
      }
    }

    const colRef = firestore.collection(readPath || path);

    try {
      const querySnapshot = await colRef.get();
      return mapQuerySnapshotToData(querySnapshot, mappedData => {
        console.log("readDoc collection without selector", mappedData);
        return dataResponse(mappedData, 200);
      });
    } catch (error) {
      console.log("readDoc collection without selector", error);
    }
  }

  async function updateDoc(docId, updateData, updatePath) {
    if (!docId || !updateData || !path && !updatePath) return dataResponse(null, 400); // Bad request

    const docRef = firestore.collection(updatePath || path).doc(docId);

    try {
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      console.log("updateDoc", updatedDoc);
      if (!updatedDoc.exists) return dataResponse(null, 404);
      return dataResponse(updatedDoc.data(), 200);
    } catch (error) {
      console.log("updateDoc", error);
      return dataResponse(error, 500);
    }
  }

  let unsubscribe = null;
  (0, _react.useEffect)(() => {
    if (!path) return;
    const colRef = firestore.collection(path);

    if (!options) {
      unsubscribe = colRef.onSnapshot(querySnapshot => {
        mapQuerySnapshotToData(querySnapshot, mappedData => {
          setData(mappedData);
        });
      });
      return () => unsubscribe();
    }

    const wheres = getWhere();
    unsubscribe = colRef.where(wheres[0], wheres[1], wheres[2]).onSnapshot(querySnapshot => {
      mapQuerySnapshotToData(querySnapshot, mappedData => {
        setData(mappedData);
      });
    });
    return () => unsubscribe();
  }, []);
  return [path ? data : null, {
    createDoc,
    deleteDoc,
    readDoc,
    updateDoc
  }];
};

exports.useFirestore = useFirestore;
