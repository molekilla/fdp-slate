# fdp-slate

Slate editor FDP integration


## Description

This is a sample project which showcases `fdp-storage` and Blossom extension with Slate React editor component.

## Branches

- `main`: Contains Slate integration with `Blossom` and `fdp-storage`.
- `crdt-slate`: Contains Slate integration with `fdp-slate-crdt-server` for Yjs CRDT applications.

## Requirements

-   [fdp-slate-crdt-server](https://github.com/molekilla/fdp-slate-crdt-server)
-   [fdp-play](https://github.com/fairDataSociety/fdp-play)

## Installation

1. Clone repository
2. Run `npm install`
3. Run `npm run build`
4. upload build folder as Website on Swarm
   ![add_website_swarm](https://user-images.githubusercontent.com/11984246/232548763-c8d9f9ef-8b3b-4abe-bcda-f47e5281ab55.png)
5. Click on view Website
   ![view_website_swarm](https://user-images.githubusercontent.com/11984246/232548858-019a8c29-ad0c-4327-a3f6-2f2842c367b9.png)

## Using

Be sure to have both `fdp-play` and `fdp-slate-crdt-server` running. Configure the Hocuspocus websocket config with the url containing the topic.

```typescript
const provider = useMemo(
      () =>
         new HocuspocusProvider({
               url: 'ws://127.0.0.1:9028/topic/crdt-document',
               name: 'slate-yjs-demo',
               onConnect: () => setConnected(true),
               onDisconnect: () => setConnected(false),
               connect: false
         }),
      []
   );

```

## How it works

Yjs Slate plugin works together with Hocuspocus (A Yjs websocket server) using an Y Shared Type. The server keeps sync with a Shared Type on the server and with an extension reads and writes to a configured Swarm feed using `y-fdp-storage` library.

### Server

```typescript
async onLoadDocument(data) {
   // Load the initial value in case the document is empty
   if (data.document.isEmpty("content")) {
      const insertDelta = slateNodesToInsertDelta(initialValue);
      const sharedRoot = data.document.get("content", XmlText);

      // @ts-ignore - Yjs types are not up to date
      sharedRoot.applyDelta(insertDelta);
   }
   return data.document;
}
```

### Client

```typescript
const editor = useMemo(() => {
   const sharedType = provider.document.get(
      'content',
      Y.XmlText
   ) as Y.XmlText;

   return withMarkdown(
      withNormalize(
            withReact(
               withYHistory(
                  withYjs(createEditor(), sharedType, {
                        autoConnect: false
                  })
               )
            )
      )
   );
}, [provider.document]);
```

## Maintainer

@molekilla

## License

Apache 2.0
