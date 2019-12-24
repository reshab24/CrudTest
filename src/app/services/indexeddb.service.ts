import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
@Injectable()
export class IndexedDbService {
    private _dbName: string;
    private _db: IDBDatabase;
    arrObject:any;
    /**
     * Sets database name.
     * @param dbName
     */
    setName(dbName: string): void {
        if (dbName && dbName.length) {
            this._dbName = dbName;
        }
    }

    /**
     * Given an array of object store names, creates stores if they don't exist.
     * @param storeNames
     * @returns void
     */
    initializeObjectStores(storeNames: string[]) {
        const timestamp = new Date().getTime();
        const request = indexedDB.open(this._dbName, timestamp);

        request.onupgradeneeded = () => {
            const db: IDBDatabase = request.result;

            storeNames.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName);
                }
            });
        };

        request.onerror = this.handleError;

        request.onsuccess = () => {
          console.log("done");
            const db = request.result;
            db.close();
        };
    }

    /**
     * Inserts a key/value pair into a named object store.
     * @param source
     * @param key
     * @param object
     */
    put(source: string, key: string, object: any):any {
        return new Promise((resolve,reject)=>{
            var open = indexedDB.open(this._dbName);
            open.onerror = ()=>{
            console.log("Error loading database");
            }
            open.onsuccess = ()=>{
            var db = open.result;
            var transaction = db.transaction(source, "readwrite");
            var objectStore = transaction.objectStore(source);
            let result= objectStore.put(object,key);
            result.onsuccess=()=>{
                resolve("done");
            }
            }
         })
    }
    get(source: string, key: string):any {
        return new Promise((resolve,reject)=>{
            let open = indexedDB.open(this._dbName);
            open.onerror = ()=>{
              console.log("Error loading database");
            }
            open.onsuccess = ()=>{
              let db = open.result;
              let transaction = db.transaction(source, "readwrite");
              let objectStore = transaction.objectStore(source);
              let result=objectStore.get(key)
              result.onsuccess=()=>{
                resolve(result.result);
              }
            }
        })
      
    }

    getAll(source: string):any {
    return new Promise((resolve,reject)=>{
        let arrObject=[];
        var open = indexedDB.open(this._dbName);
        open.onerror = ()=>{
        console.log("Error loading database");
        }
        open.onsuccess = ()=>{
        var db = open.result;
        var transaction = db.transaction(source, "readwrite");
        var objectStore = transaction.objectStore(source);
        let request = objectStore.openCursor();
        request.onerror = function(event) {
        };

        request.onsuccess = function(event) {
        let cursor =request.result;
        if (cursor) {
            let key = cursor.primaryKey;
            let value = cursor.value;
            arrObject.push({key,value});
            cursor.continue();
        }
        else {
            resolve(arrObject);
        }
        };
        }
    })
}
    remove(source: string, key: string):any {
        return new Promise((resolve,reject)=>{
            var open = indexedDB.open(this._dbName);
            open.onerror = ()=>{
            console.log("Error loading database");
            }
            open.onsuccess = ()=>{
            var db = open.result;
            var transaction = db.transaction(source, "readwrite");
            var objectStore = transaction.objectStore(source);
            const request=objectStore.delete(key);
                request.onsuccess=()=>{
                    resolve("done");
                }
            }
        })
    }
    /**
     * Gets a value by key from a named object store.
     * @param source
     * @param key
     */
    // get(source: string, key: string): Observable<any> {
    //     return Observable.create((observer: any) => {
    //         this.getObjectStore(source).subscribe((store: IDBObjectStore) => {
    //             const request = store.get(key);

    //             request.onsuccess = () => {
    //                 observer.next(request.result);
    //                 observer.complete();
    //                 this._db.close();
    //             };
    //         });
    //     });
    // }

    /**
     * Removes a value by key from a named object store.
     * @param source
     * @param key
     */
    // remove(source: string, key: string): Observable<any> {
    //     return Observable.create((observer: any) => {
    //         this.getObjectStore(source, 'readwrite').subscribe((store: IDBObjectStore) => {
    //             const request = store.delete(key);
    //             request.onsuccess = (e: any) => {
    //                 observer.next(key);
    //                 observer.complete();
    //                 this._db.close();
    //             };
    //         });
    //     });
    // }

    /**
     * Completely removes database by set name.
     */
    clear(): Observable<any> {
        return Observable.create((observer: any) => {
            const request = indexedDB.deleteDatabase(this._dbName);

            request.onsuccess = (next) => {
                observer.next(true);
                observer.complete();
            };
            request.onerror = this.handleError;
            request.onblocked = () => {
                this.handleError('Could not delete database due to the operation being blocked.');
            };
        });
    }

    scan(source: string): Observable<any> {
        return Observable.create((observer: any) => {
            this.getObjectStore(source, 'readwrite').subscribe((store: IDBObjectStore) => {
                store.openCursor().onsuccess = (event) => {
                    const target = event.target as any;
                    const cursor = target.result;

                    if (cursor) {
                        observer.next(cursor);
                        cursor.continue();
                    } else {
                        observer.complete();
                        this._db.close();
                    }
                };
            });
        });
    }

    /**
     * Request an object store, in either readwrite or readonly mode. Defaults to readonly.
     * @param storeName
     * @param readMode
     */
    private getObjectStore(storeName: string, readMode: 'readwrite' | 'readonly' = 'readonly'): Observable<IDBObjectStore> {
        return Observable.create((observer: any) => {
            if (this._dbName) {
                const request = indexedDB.open(this._dbName);

                request.onsuccess = () => {
                    this._db = request.result;
                    console.log( request.result," request.result");
                    const store = this._db.transaction([storeName], readMode).objectStore(storeName);
                    observer.next(store);
                    observer.complete();
                };

                request.onerror = this.handleError;
            } else {
              console.log("rishab");
                observer.error('No database name set - unable to open database');
            }
        });
    }

    /**
     * Shared error handler.
     * @param error
     */
    private handleError(error: any): Observable<any> {
        console.error(error);

        if (this._db) {
            this._db.close();
        }

        return Observable.throw(error);
    }
}
