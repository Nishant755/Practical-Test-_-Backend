const fs = require('fs');

// Load the JSON data
const rawData = fs.readFileSync('data.json');
const data = JSON.parse(rawData);
console.log("--- Question 1: JSON Manipulation ---\n");
// 1. Get average budget of all active campaigns from Marketing department
function getAverageMarketingBudget(data) {
    const marketingDeptName = data.departments.find(d => d.name === 'Marketing');
    if (!marketingDeptName) return 0;

    let totalBudget = 0;
    let count = 0;

    marketingDeptName.teams.forEach(teamName => {
        if (teamName.campaigns) {
            teamName.campaigns.forEach(campaign => {
                //console.log(campaign);
                if (campaign.active) {
                    totalBudget += campaign.budget;
                    count++;
                }
            });
        }
    });
    // console.log(totalBudget);
    // console.log(count);
    return count === 0 ? 0 : totalBudget / count;
}

console.log(`1. Average budget of active Marketing campaigns: ${getAverageMarketingBudget(data)}`);


// 2. Get completed project from Engineering department
function getCompletedEngineeringProjects(data) {
    const engineeringDeptName = data.departments.find(d => d.name === 'Engineering');
    if (!engineeringDeptName) return [];

    let completedProjects = [];

    engineeringDeptName.teams.forEach(teamName => {
        if (teamName.projects) {
            teamName.projects.forEach(project => {
                if (project.completed) {
                    completedProjects.push(project.name);
                }
            });
        }
    });

    return completedProjects;
}

console.log(`2. Completed projects from Engineering department: ${getCompletedEngineeringProjects(data)}`);


// 3. Get single manager who has more running projects or campaigns with high budget projects
function getManagerWithMostActiveItems(data) {
    let maxCount = -1;
    let topManagerName = null;

    data.departments.forEach(dept => {
        dept.teams.forEach(team => {
            let activeCount = 0;
            if (team.projects) {
                activeCount += team.projects.filter(p => !p.completed).length;
            }
            if (team.campaigns) {
                activeCount += team.campaigns.filter(c => c.active).length;
            }
            if (activeCount > maxCount) {
                maxCount = activeCount;
                topManagerName = team.lead.name;
            }
        });
    });

    return topManagerName;
}

console.log(`3. Manager with most active projects/campaigns: ${getManagerWithMostActiveItems(data)}`);


// 4. Return project name whose team member are same.
function getProjectsWithSameTeamMembers(data) {
    const allProjectsList = [];
    data.departments.forEach(dept => {
        dept.teams.forEach(team => {
            if (team.projects) {
                team.projects.forEach(project => {
                    const sortedMembers = [...project.team_members].sort();
                    allProjectsList.push({
                        name: project.name,
                        members: sortedMembers,
                        membersStr: JSON.stringify(sortedMembers)
                    });
                });
            }
        });
    });
    const matchingProjectsList = [];
    for (let i = 0; i < allProjectsList.length; i++) {
        for (let j = i + 1; j < allProjectsList.length; j++) {
            if (allProjectsList[i].membersStr === allProjectsList[j].membersStr) {
                matchingProjectsList.push(`${allProjectsList[i].name} and ${allProjectsList[j].name}`);
            }
        }
    }

    return matchingProjectsList;
}

console.log(`4. Projects with same team members: ${getProjectsWithSameTeamMembers(data).join(', ')}`);
