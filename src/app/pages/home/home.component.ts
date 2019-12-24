import { Component, OnInit } from '@angular/core';
import { IndexedDbService } from 'src/app/services/indexeddb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private _dbName = 'crud';
  private _storeName = 'registration';
  listDataColumns: string[] = ['firstName','lastName','password','email','contactNumber','action'];
  listData:any;

  constructor(private idb: IndexedDbService, private router: Router) {
    idb.setName(this._dbName);
    idb.initializeObjectStores([this._storeName]);
    this.getAllData();
   }

  ngOnInit() {
    this.getAllData();
  }
  getAllData(){
    this.idb.getAll(this._storeName)
    .then((res:any)=>
      {
        this.listData=res;
        this.listData.map(res=>{
        res['firstName']=res.value.firstName;
        res['lastName']=res.value.lastName;
        res['password']=res.value.password;
        res['email']=res.value.email;
        res['contactNumber']=res.value.contactNumber;
        })
      }
    );
  }
  editData(id:string){
    this.router.navigate([`reg/`,id]);
  }
  deleteData(id:string){
    this.idb.remove(this._storeName,id).then(res=>this.getAllData());
  }

}
