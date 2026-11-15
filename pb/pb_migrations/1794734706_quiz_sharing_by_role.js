/// <reference path="../pb_data/types.d.ts" />

// Share a quiz with whole roles (all students, all admins) on top of the
// per-user sharing: a user holding one of the roles sees the quiz, its items
// and its card count, including users who join the role later.

const QUIZ_COUNTS_QUERY = (withRoles) => `SELECT
     q.id AS id,
     q."Owner" AS Owner,
     q.shared_with_users,${withRoles ? '\n     q.shared_with_roles,' : ''}
     CAST(COALESCE(COUNT(qi.id), 0) AS INTEGER) AS items_count,
     CAST(SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_sign,
     CAST(SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_person
   FROM quiz AS q
   LEFT JOIN quiz_item AS qi
     ON qi."Quiz" = q.id
   GROUP BY q.id, q."Owner", q.shared_with_users${withRoles ? ', q.shared_with_roles' : ''}`

const QUIZ_RULE = 'Owner = @request.auth.id || shared_with_users.id ?= @request.auth.id'
const QUIZ_ITEM_RULE =
  '@request.auth.id = Quiz.Owner.id || Quiz.shared_with_users.id ?= @request.auth.id'

migrate(
  app => {
    const quiz = app.findCollectionByNameOrId('quiz')
    quiz.fields.add(
      new Field({
        cascadeDelete: false,
        collectionId: app.findCollectionByNameOrId('roles').id,
        hidden: false,
        maxSelect: 999,
        minSelect: 0,
        name: 'shared_with_roles',
        presentable: false,
        required: false,
        system: false,
        type: 'relation',
      }),
    )
    const quizRule = `${QUIZ_RULE} || shared_with_roles.id ?= @request.auth.roles.id`
    quiz.listRule = quizRule
    quiz.viewRule = quizRule
    app.save(quiz)

    const quizItem = app.findCollectionByNameOrId('quiz_item')
    const itemRule = `${QUIZ_ITEM_RULE} || Quiz.shared_with_roles.id ?= @request.auth.roles.id`
    quizItem.listRule = itemRule
    quizItem.viewRule = itemRule
    app.save(quizItem)

    const counts = app.findCollectionByNameOrId('quiz_counts')
    counts.viewQuery = QUIZ_COUNTS_QUERY(true)
    counts.listRule = quizRule
    counts.viewRule = quizRule
    app.save(counts)
  },
  app => {
    const counts = app.findCollectionByNameOrId('quiz_counts')
    counts.viewQuery = QUIZ_COUNTS_QUERY(false)
    counts.listRule = QUIZ_RULE
    counts.viewRule = QUIZ_RULE
    app.save(counts)

    const quizItem = app.findCollectionByNameOrId('quiz_item')
    quizItem.listRule = QUIZ_ITEM_RULE
    quizItem.viewRule = QUIZ_ITEM_RULE
    app.save(quizItem)

    const quiz = app.findCollectionByNameOrId('quiz')
    quiz.fields.removeByName('shared_with_roles')
    quiz.listRule = QUIZ_RULE
    quiz.viewRule = QUIZ_RULE
    app.save(quiz)
  },
)
