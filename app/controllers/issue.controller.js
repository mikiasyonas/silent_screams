const db = require("../models");
const Issue = db.issues; 
const Comment = db.comments;


exports.createIssue = (req, res) => {
    return Issue.create({
        userId: res.locals.loggedInUser.id,
        categoryId: req.body.categoryId,
        issue: req.body.issue,
        status: 0
    })
        .then((issue) => {
            console.log(">> Created issue: " + JSON.stringify(issue, null, 4));
            return res.status(200).send({
                message: "success",                    
                issue: issue
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: ">> Error while creating issue: ",
                error: err
            })
        });
};

exports.createComment = (req, res) => {
    return Comment.create({
        comment: req.body.comment,
        user_id: res.locals.loggedInUser.id,
        issueId: req.params.issueId,
        status: 1
    })
        .then(async (comment) => {
            const issue = await Issue.findByPk(comment.issueId);
            const buttonId = issue.buttonId;
            const telegramId = issue.telegramId;
            const count = await Comment.count({
                where: {
                    issueId: comment.issueId
                }
            })
            res.status(200).send({
                message: ">> Created comment: ",
                buttonId: buttonId,
                telegramId: telegramId,
                count: count
            })
        })
        .catch((err) => {
            res.status(500).send(err);
        });
};

exports.findIssueById = (req, res) => {
    return Issue.findByPk(req.params.issueId, { include: ["comments", "category"] })
        .then((issue) => {
            res.status(200).send({
                issue: issue
            });
        })
        .catch((err) => {
            res.status(500).send({
                error: ">> Error while finding issue: ",
                err: err
            });
        });
};

exports.findCommentById = (id) => {
    return Comment.findByPk(id, { include: ["issue"] })
        .then((comment) => {
            return comment;
        })
        .catch((err) => {
            console.log(">> Error while finding comment: ", err);
        });
};

exports.findAll = (req, res) => {
    return Issue.findAll({
        include: ["category"],
    }).then((issues) => {
        if(issues.length != 0) {
            res.send(issues);
        } else {
            res.status(204).send({
                message: "no data"
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: 'failure',
            error: err
        });
    })
};

exports.getApproved = async (req, res) => {
    // console.log('started');
    const issues = await Issue.findAll({
        include: [
            "category"
        ],
        where: {
            status: 1
        }
    });

    if (issues.length != 0) {
        issue = issues[0];
        console.log(issue);
        Issue.update({
            sent: 1
        },
            {
                where: {
                    id: issue.id
                }
            }).then(() => {
                res.status(200).send({
                    issue: issue
                });
            }).catch(err => {
                res.status(500).send({
                    error: err
                });
            })
    } else {
        res.status(204).send({
            message: 'no data'
        })
    }
};

exports.myIssues = async (req, res) => {
    try {
        console.log('started');
        const issues = await Issue.findAll({
            include: [
                "category"
            ],
            where: {
                status: 1,
                userId: res.locals.loggedInUser.id
            }
        });

        if (issues.length != 0) {
            // issue = issues[0];
            // console.log(issue);
            res.status(200).send({
                message: "success",
                issues: issues
            })
        } else {
            console.log("no data")
            res.status(204).send({
                message: 'no data'
            })
        }
    } catch (err) {
        res.status(500).send({
            error: err
        })
    }
};

exports.adminGetApproved = async (req, res) => {
    try {
        const issues = await Issue.findAll({
            where: {
                status: 1,
            }
        });
        if (issues.length != 0) {
          res.status(200).send({
            issues: issues
          });
        } else {
            res.status(204).send({
                message: 'no data'
            })
        }
    } catch(err) {
        res.status(500).send({
            error: err
        })
    }
};


exports.adminPendingIssues = async (req, res) => {
    const issues = await Issue.findAll({
        include: [
            "category"
        ],
        where: {
            status: 0,
        }
    });

    if (issues.length != 0) {
      res.status(200).send({
        issues: issues
      });
    } else {
        res.status(204).send({
            message: 'no data'
        })
    }
};


exports.adminGetDeclined = async (req, res) => {
    const issues = await Issue.findAll({
        include: [
            "category"
        ],
        where: {
            status: 3,
        }
    });

    if (issues.length != 0) {
      res.status(200).send({
        issues: issues
      });
    } else {
        res.status(204).send({
            message: 'no data'
        })
    }
};



exports.deleteIssue = (req, res) => {
    const id = req.params.issueId;
    Issue.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.status(200).send({
            message: 'deleted an issue successfully with id = ' + id
        });
    }).catch(err => {
        res.status(500).send({
            message: 'failure',
            erorr: err
        })
    })
};

exports.updateIssue = (req, res) => {
    const id = req.params.issueId;
    Issue.update({
        user_id: req.body.user_id,
        issue: req.body.issue,
        status: req.body.status
    },
        {
            where:
            {
                id: req.params.issueId
            }
        }
    ).then(() => {
        res.status(200).send('updated an issue successfully with id = ' + id);
    }).catch(err => {
        res.send({
            message: 'failure',
            erorr: err
        })
    })
};
exports.approveIssue = (req, res) => {
    const id = req.params.issueId;
    Issue.update({
        user_id: req.body.user_id,
        issue: req.body.issue,
        status: 1
    },
        {
            where:
            {
                id: req.params.issueId
            }
        }
    ).then(() => {
        res.status(200).send({
            message: 'approved an issue successfully with id = ' + id
        });
    }).catch(err => {
        res.status(500).send({
            message: 'failure',
            erorr: err
        })
    })
};

exports.declineIssue = (req, res) => {
    const id = req.params.issueId;
        Issue.update({
        user_id: req.body.user_id,
        issue: req.body.issue,
        status: 3
    },
        {
            where:
            {
                id: req.params.issueId
            }
        }
    ).then(() => {
        res.status(200).send({
            message: 'decline an issue successfully with id = ' + id,
        });
    }).catch(err => {
        res.status(500).send({
            message: 'failure',
            erorr: err
        })
    })
};


exports.addDetails = (req, res) => {
    Issue.update({
        telegramId: req.body.telegramId,
        buttonId: req.body.buttonId
    },
    {
        where:
        {
            id: req.params.issueId
        }
    }).then(() => {
        res.send({
            message: 'added details to an issue with id = ' + req.params.issueId
        });
    }).catch(err => {
        res.send(err);
    })
};

exports.getIssuesByCategory = (req, res) => {
    Issue.findAll({
        where: {
            categoryId: req.params.categoryId,
        }
    }).then(issues => {
        if (issues) {
            res.send(issues);
        } else {
            res.send({
                message: 'no data'
            })
        }
    }).catch(err => {
        res.send(err);
    })
}
