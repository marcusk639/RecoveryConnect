// const GroupTabNavigator = createBottomTabNavigator<GroupTabParamList>();

// const GroupDetailsNavigator: React.FC<{route: {params: {groupId: string}}}> = ({
//   route,
// }) => {
//   const {groupId} = route.params;

//   return (
//     <GroupTabNavigator.Navigator>
//       <GroupTabNavigator.Screen
//         name="Overview"
//         component={GroupOverviewScreen}
//         initialParams={{groupId}}
//       />
//       <GroupTabNavigator.Screen
//         name="Members"
//         component={GroupMembersScreen}
//         initialParams={{groupId}}
//       />
//       <GroupTabNavigator.Screen
//         name="Announcements"
//         component={GroupAnnouncementsScreen}
//         initialParams={{groupId}}
//       />
//       <GroupTabNavigator.Screen
//         name="Treasury"
//         component={GroupTreasuryScreen}
//         initialParams={{groupId}}
//       />
//     </GroupTabNavigator.Navigator>
//   );
// };
