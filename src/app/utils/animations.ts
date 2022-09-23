import {animate, query, state, style, transition, trigger} from '@angular/animations';

export const slideFromRight = [
  state('in', style({width: '500px', transform: 'translateX(0)'})),
  transition('void => *', [style({width: '0', transform: 'translateX(100%)'}), animate(400)]),
  transition('* => void', [animate(400, style({width: '0', transform: 'translateX(100%)'}))]),
];

export const slideFromBottom = [
  transition('void => *', [style({height: '0'}), animate(400)]),
  transition('* => void', [style({height: 'auto'}), animate(400, style({height: '0'}))]),
];


export const showHide = [
  state('in', style({opacity: 1, transform: 'scale(1)'})),
  transition('void => *', [style({opacity: 0, transform: 'scale(0)'}), animate(400)]),
  transition('* => void', [animate(400, style({opacity: 0, transform: 'scale(0)'}))]),
];

export const hideShowShade = [
  state('in', style({opacity: 1})),
  transition('void => *', [style({opacity: 0}), animate(150)]),
  transition('* => void', [animate('150ms 150ms', style({opacity: 0}))]),
];

export const showHideDelayed = [
  state('in', style({opacity: 1, transform: 'scale(1)'})),
  transition('void => *', [style({opacity: 0, transform: 'scale(0)'}), animate('150ms 150ms')]),
  transition('* => void', [animate(150, style({opacity: 0, transform: 'scale(0)'}))]),
];


export const showHideDialog = [
  state('in', style({opacity: 1})),
  transition('void => *', [
    query('nb-card', [style({transform: 'scale(0) translateY(-100px)',  opacity: 0})]),
    style({opacity: 0}),
    animate(150),
    query('nb-card', [animate(200, style({transform: 'scale(1) translateY(0)',  opacity: 1}))])
  ]),
  transition('* => void', [
    query('nb-card', [ animate(200, style({transform: 'scale(0) translateY(-100px)', opacity: 0}))]),
    animate(150, style({opacity: 0}))]
  ),
];


export const iconCame = [
  state('in', style({width: 'auto'})),
  state('void', style({width: '0px'})),
  transition('void=>*', animate(400)),
  transition('*=>void', animate(400))
];
