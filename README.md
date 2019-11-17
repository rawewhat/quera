# QueRa

is a simplified **Firestore** and **GraphQL**(soon) client built **purely** in React **hooks**.

## Content

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [1. CRUD Operation](#1-crud-operation)
    - [1.1. createDoc(createData, collectionPath)](#11-createdoccreatedata-collectionpath)
    - [1.2. deleteDoc(docId, collectionPath)](#12-deletedocdocid-collectionpath)
    - [1.3. readDoc(undefined, collectionPath)](#13-readdocundefined-collectionpath)
    - [1.4. readDoc(docId, collectionPath)](#14-readdocdocid-collectionpath)
    - [1.5. readDoc(whereClause, collectionPath)](#15-readdocwhereclause-collectionpath)
    - [1.6. updateDoc(docId, updateData, collectionPath)](#16-updatedocdocid-updatedata-collectionpath)
  - [2. Real-time Data Subscription](#2-real-time-data-subscription)
    - [2.1. useFirestore(firestore, collectionPath)](#21-usefirestorefirestore-collectionpath)
    - [2.2. useFirestore(firestore, collection_path, where_clause)
](#22-usefirestorefirestore-collection_path-where_clause)
- [Example](#example)
- [Demo](#demo)
- [License](#license)

## Install

using npm  
`npm i @rawewhat/quera`

using yarn  
`yarn add @rawewhat/quera`

## Usage

- just import useFirestore() hook in your React component.

```javascript
import useFirestore from "@rawewhat/quera";
```

- call useFirestore() hook to get subscribed data and CRUD handler functions

```javascript
const [data, handler] = useFirestore(collectionPath, whereClause);
```

- handlers include CRUD basic function like createDoc(), deleteDoc(), readDoc(), and updateDoc().
- passing where clause to select only documents with specific value `"?name == QueRa"`

## API

### 1. CRUD Operation

- call useFirestore() hook to get CRUD handler functions.

```javascript
const [, { createDoc, deleteDoc, readDoc, updateDoc }] = useFirestore();
```

- **NOTE**  
  without passing **path** to **useFirestore(path)** hook,  
  all CRUD functions required **collectionPath** parameter!

#### 1.1. createDoc(createData, collectionPath)

- createData: object
- collectionPath: string

```javascript
createDoc({ name: "New Name" }, "user").then(doc => {
  console.log("doc.name =", doc.data.name);
});

const createdDoc = await createDoc({ name: "New Name" }, "user");
console.log("doc.name =", createdDoc.data.name);
```

Result: `doc.name = New Name`

#### 1.2. deleteDoc(docId, collectionPath)

- docId: string
- collectionPath: string

```javascript
deleteDoc("007", "user").then(doc => {
  console.log("doc 007", !doc.data ? "deleted" : "delete fail!");
});

const deletedDoc = await deleteDoc("007", "user");
console.log("doc 007", !deletedDoc.data ? "deleted" : "delete fail!");
```

Result: `doc 007 deleted`

#### 1.3. readDoc(undefined, collectionPath)

- passing **undefined** to get all documents in collection path

* collectionPath: string

```javascript
readDoc(undefined, "user").then(response => {
  response.data.forEach(doc => {
    console.log(`${doc.id}`, doc);
  });
});

const response = await readDoc(undefined, "user");
response.data.forEach(doc => {
  console.log(`doc ${doc.id} =`, doc);
});
```

Result: `doc 007 = { name: New Name }`

#### 1.4. readDoc(docId, collectionPath)

- docId: string
- collectionPath: string

```javascript
readDoc("007", "user").then(doc => {
  console.log("doc 007", doc);
});

const doc = await readDoc("007", "user");
console.log("doc 007 =", doc);
```

Result: `doc 007 = { name: New Name }`

#### 1.5. readDoc(whereClause, collectionPath)

- whereClause: string
- collectionPath: string

```javascript
readDoc("?name == New Name", "user").then(response => {
  response.data.forEach(doc => {
    console.log(`doc ${doc.id} =`, doc);
  });
});

const response = await readDoc("?name == New Name", "user");
response.data.forEach(doc => {
  console.log(`doc ${doc.id} =`, doc);
});
```

Result: `doc 007 = { name: New Name }`

#### 1.6 updateDoc(docId, updateData, collectionPath)

- docId: string
- updateData: object
- collectionPath: string

```javascript
updateDoc('007', { name: 'Updated Name' }, 'user').then(doc => {
    console.log('doc 007 updated =', doc)
})

const updatedDoc = await updateDoc('007', { name: 'Updated Name' }, 'user')
console.log('doc 007 updated =', doc)
```

Result: `doc 007 updated = { name: Updated Name }`

### 2. Real-time Data Subscription

```javascript
const [data, handlers] = useFirestore(collectionPath);
```

- data: arrays
- collectionPath: string

- **NOTE**  
  passing **path** to **useFirestore(path)** hook will subscribe component to the collection path,  
  all CRUD functions will use **collectionPath** passed from useFirestore(path) hook.
  but you can still force to use collectionPath passing from CRUD function instead.

#### 2.1 useFirestore(firestore, collectionPath)

- firestore: object
- collectionPath: string

```javascript
const [data, handlers] = useFirestore(firestore, 'user')
console.log('subscribed data =', data)
```

#### 2.2 useFirestore(firestore, collection_path, where_clause)

- firestore: object
- collectionPath: string
- whereClause: string

```javascript
const [data, handlers] = useFirestore(firestore, 'user', '?name == Updated Name')
console.log('subscribed data', data)
```

## Example

```javascript
import React, { useEffect } from "react";
import { useFirestore } from "@rawewhat/quera";

const _ = undefined;
const ID_TEST = "SbfOYDq77jG8N6v9N15k";
const CREATE_DATA_TEST = { name: "New Name" };

const HomeScreen = () => {
  const [{ data }, { createDoc, deleteDoc, readDoc, updateDoc }] = useFirestore(
    "delivery_telegram"
  );
  console.log("data", data);

  const handleClick = type => () => {
    switch (type) {
      case "create":
        return createDoc(CREATE_DATA_TEST, "delivery_telegram");
      case "delete":
        return deleteDoc(ID_TEST, "delivery_telegram");
      case "read":
        return readDoc(_, "delivery_telegram");
      case "read-by-id":
        return readDoc(ID_TEST, "delivery_telegram");
      case "read-by-query":
        return readDoc("?status == REQUESTED", "delivery_telegram");
      case "update":
        return updateDoc(ID_TEST, { status: "OPERATED" }, "delivery_telegram");
      case "update-requested":
        return updateDoc(ID_TEST, { status: "REQUESTED" }, "delivery_telegram");
      default:
    }
  };

  return (
    <div style={styles.container}>
      <h1>Test useFirestore</h1>
      <div style={styles.buttonContainer}>
        <h2>Create</h2>
        <Button title="Create" onClick={handleClick("create")} />
        <h2>Delete</h2>
        <Button title="Delete" onClick={handleClick("delete")} />
        <h2>Read</h2>
        <Button title="Read all doc" onClick={handleClick("read")} />
        <Button title="Read doc by id" onClick={handleClick("read-by-id")} />
        <Button
          title="Read doc by query"
          onClick={handleClick("read-by-query")}
        />
        <h2>Update</h2>
        <Button title="Update Operated" onClick={handleClick("update")} />
        <Button
          title="Update Requested"
          onClick={handleClick("update-requested")}
        />
      </div>
    </div>
  );
};

const Button = ({ title, children, onClick }) => {
  return (
    <button style={styles.button} onClick={onClick}>
      {children || title}
    </button>
  );
};
```

## Demo

I wrote a simple site to test out QueRa functionality in the demo project.

- `git clone git@github.com:rawewhat/routra.git` to clone the project
- `cd demo` change to demo directory
- `yarn install` to install dependencies
- `yarn dev` it will be ready on http://localhost:1234

## License

```
MIT License
-----------

Copyright (c) 2019 Cheng Sokdara (https://rawewhat-team.com)
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
```
