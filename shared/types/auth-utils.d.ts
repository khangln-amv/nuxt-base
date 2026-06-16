// When you integrate `nuxt-auth-utils`, type its session `user` to our public
// shape so the server helpers (`setUserSession`/`requireUserSession`/
// `getUserSession`) and the client `useUserSession().user` all resolve to
// `UserData`. Uncomment once the module is installed:
//
// declare module '#auth-utils' {
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation aliases UserData
//   interface User extends UserData {}
// }

export {};
