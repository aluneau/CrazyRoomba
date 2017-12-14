import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class RetreiveConfig{
    config:any;
    constructor(private http: HttpClient) {
    }

    getConfig(){
        let promise = new Promise((resolve, reject) => {
            this.http.get('config/config.json').toPromise().then(
                res => {
                    resolve(res);
                }
            )
        });
        

        return promise;
    }

}