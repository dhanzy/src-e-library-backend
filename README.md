# E-LIBRARY BACKEND

## UPLOAD FILE

- Request

```sh
$ curl -X POST -F "documentFile=@/path/to/pdf" -F "author=Amaino oti" -F "title=Life of Bioengineer Programmer"  http://localhost:8080/api/upload
```

- Response

```json
{
  "title": "Life of Bioengineer Programmer",
  "urlPath": "public/documents/Bioengineering Student in Abuad.pdf",
  "author": "Amaino oti",
  "_id": "63225d922c5781b2581a17f0",
  "createdAt": "2022-09-14T23:02:42.658Z",
  "updatedAt": "2022-09-14T23:02:42.658Z",
  "__v": 0
}
```

## GET ALL DOCUMENT

- Request

```sh
$ curl -X GET "http://localhost:8080/api/document"
```

- Response

```json
[
  {
    "_id": "63225f8a3ddde25884c7ff12",
    "title": "Life of Bioengineer Programmer",
    "urlPath": "public/documents/Programmer in Bioengineering.pdf",
    "author": "Amaino oti",
    "createdAt": "2022-09-14T23:11:06.158Z",
    "updatedAt": "2022-09-14T23:11:06.158Z",
    "__v": 0
  },
  {
    "_id": "63225f8a3ddde25884c7ff12",
    "title": "Life of An Agba Programmer",
    "urlPath": "public/documents/Agba Programmer version 1.pdf",
    "author": "Onyekachi",
    "createdAt": "2022-09-14T23:11:06.158Z",
    "updatedAt": "2022-09-14T23:11:06.158Z",
    "__v": 0
  }
]
```

## Get Recent Documents

This returns a list of new documents with a limit of 6 by adding `?new=true` to the api url

- Request

```sh
$ curl -X GET "http://localhost:8080/api/document?new=true"
```

- Response

```json
[
  {
    "_id": "63225f8a3ddde25884c7ff12",
    "title": "Life of Bioengineer Programmer",
    "urlPath": "public/documents/Programmer in Bioengineering.pdf",
    "author": "Amaino oti",
    "createdAt": "2022-09-14T23:11:06.158Z",
    "updatedAt": "2022-09-14T23:11:06.158Z",
    "__v": 0
  },
  {
    "_id": "63225f8a3ddde25884c7ff12",
    "title": "Life of An Agba Programmer",
    "urlPath": "public/documents/Agba Programmer version 1.pdf",
    "author": "Onyekachi",
    "createdAt": "2022-09-14T23:11:06.158Z",
    "updatedAt": "2022-09-14T23:11:06.158Z",
    "__v": 0
  }
]
```
