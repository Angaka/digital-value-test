import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatMenu } from '@angular/material';
import { Category } from '../../models/category.model';
import { VolumeService } from 'src/app/core/services/volume.service';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {

  @Input() public items: Category[];
  @ViewChild(MatMenu, { static: true }) public childMenu: MatMenu;

  constructor(private volumeService: VolumeService) {
  }

  ngOnInit() {
  }

  selectCategory(category: Category) {
    console.log(category);
    this.volumeService.setSelectedCategory(category);
  }
}
