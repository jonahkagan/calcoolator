% Calcoolator: Linking Representations of Functions to Deepen
  Mathematical Understanding in Middle-School Students
% Clara Kliman-Silver; Jonah Kagan; Jessica Liu

To use the Calcoolator, go to
<http://cs.brown.edu/people/jmkagan/calc/calc.html>.

# Introduction

Functions play a key role in mathematics learning, as children
transition from the concreteness of arithmetic to the abstraction of
geometry and algebra. However, the leap from the concrete to the
abstract is often difficult for children, especially when teachers are
under pressure to raise standardized test scores in favor of
instilling a mathematical understanding. While textbooks, educational
technology games, and calculators can all cement a student’s comfort
with functions, some teachers find their resources lacking (Hartter,
2009).  Michele Pistocco, a sixth grade math teacher at the DelSesto
Middle School in Providence, Rhode Island, explains that older
students struggle to connect the symbolic representation, or equation
($f(x) = 3x + 6$), with a graph or even a table of values. What
prevents children from unifying these concepts? There are several
culprits at hand: first, a lack of thorough teaching at many schools
in the United States (due to pressures of testing, curricular
standards, or limited resources), and second, curricula that do not
emphasize the relationships between multiple representations of
functions but instead treat them as separate entities. Specifically,
an emphasis is placed on the equation––suddenly, there are letters
where there used to be numbers, and no single solution (Booth, 1988).
Our “Calcoolator,” a web-based graphing calculator, seeks to address
this problem by implementing several representations side-by-side and
allowing them to be manipulated in kind. We argue that our design will
endow students with an understanding of functions on several levels:
the web application allows users to view the graph of a function, its
symbolic notation, and a table of values associated with it.
Manipulating one representation will automatically update the other
representations: we believe that by viewing and exploring these
representations together, students will understand how the
representations relate to one another.

# Motivation for the Calcoolator

The transition between the concrete and the abstract is one that can
be difficult for students, and the concept of functions may be even
more difficult. During pre-algebra courses, students may become
comfortable with solving for x, but confusion sets in when they cannot
solve for $f(x)$ (Carpenter, Franke, and Levi, 2003). Functions are
often introduced as “input-output” machines (put in 7, get out 14, put
in 8, get out 16: what’s the rule?), but students often have trouble
understanding the relationship between the formal rule $f(x) = 2x$ and
the table of values.  Michele Pistocco explained that she and her
colleagues see this problem frequently among the middle school
students they teach, a situation that becomes increasingly difficult
as students approach first-year algebra.  What does it mean to
represent a function algebraically, rather than as a group of numbers?
How can a function be represented as a graph?  According to both Ms.
Pistocco and extant literature, mathematics teaching tends to
emphasize the symbolic notation, which is the most abstract of the
three representations, over the graph and input/output chart. While
this approach works for some students, it is problematic for others
who either do not understand the notation or do not grasp functions
themselves (Romberg, Fennema, and Carpenter, 1993).

Graphing calculators and similar programs certainly show multiple
views of a function (functional notation, table of values, and graph),
but each view is typically isolated on its own screen, preventing
users from exploring the three representations simultaneously. We
looked at a number of web-based graphing calculators and found the
same issue: the three representations were not given equal weight. A
lecture given by Brown University computer science professor Shriram
Kristhnamurthi and discussions with two high school math teachers at
the Winsor School in Boston, Massachusetts, suggested to us that a
design that balances the three representations might improve students’
understanding of functions and abstraction. Winsor teacher Laura
Cohen, who has taught algebra, precalculus (trigonometry), and
calculus courses, believes that a complete understanding of functions
draws on all three representations.  Even once students grasp the
functional notation, they should still examine graphs to determine the
function’s long-term behavior. Tables can also yield this kind of
information, especially as students learn about intercepts,
intersections, or, later on, asymptotes. Moreover, different learning
styles may lead students to prefer one representation or set of
representations to another. Thus, we began to develop the Calcoolator,
a web application that presents functional representations, tables,
and graphs on the same screen. We expect that in its current
instantiation the Calcoolator will be useful primarily to
late-middle/early-high-school-age students who are exploring functions
and their graphs. Specifically, we cater to pre-algebra and algebra
classes, though the tool might also benefit pre-calculus courses
interested in exploring the long-term behaviors of functions.

# Design

Graphing calculators are used extensively in middle and high school
math classes, with tools ranging from Texas Instruments graphing
calculators to internet-based calculators (such as the HTML5
calculator), which offer more advanced graphing techniques. We sought
not to replicate existing designs but rather develop our own
prototype, which emphasizes the relationship between different views
of the function. When manipulating one representation of a function,
Calcoolator users will see the other representations change
immediately. For example, changing the coefficient in the symbolic
notation will cause not only the graph but also the table to update
immediately.

We designed the Calcoolator such that the graphs and tables can be
easily manipulated and users can explore their behaviors. Graphs of
first and second-degree polynomials are altered with “control points,”
small circles stationed on the y-axis and another location (for lines)
or the vertex and on one of the branches (for parabolas). Users can
use these points to change the slope of lines, the width of a
parabola, and y-intercept in both cases. As the graphs are adjusted,
the function’s equation and table of values are updated dynamically.
(Third-degree and higher polynomials cannot be manipulated in the
current instantiation.) Moreover, we aim for easy readability: the
Calcoolator has a “snap to grid” feature that can be toggled on and
off. When on, all points shown in the table lie on grid lines (for
“nice, round numbers”); when off, the points can lie anywhere and
scroll smoothly. This feature allows for either easy calculation or a
deeper exploration of functional behavior.  Scrubbing, additionally,
allows students to see how the coefficients of each term affect the
graph. We sought to solidify the relationship between each of the
representations of the function by color-coding the graph, symbolic
notation, and table (i.e. all representations associated with $f(x) =
2x +3$ are purple). We believe this visual cue will better link the
representations together.

One of the key themes underlying the Calcoolator is intuitiveness. The
teachers we consulted believe that our design offers something lacking
in many graphic calculators and tools meant to teach functions. The
Calcoolator does not bias one representation over another, instead
allowing students to compare, explore, and, ultimately, learn
functions in a way they individually find intuitive. Not only did we
aim to make our design easy to use, but we also wanted to develop a
tool that allows students to learn and build connections on their own.
According to Ms.  Pistocco and the other teachers whom we consulted,
the constraints of existing curricula and current resources limit
students’ ability to reason independently and investigate functions in
such a manner.  Moreover, we hope that the flexibility of our design
will accommodate different learning styles (i.e. visual thinking, for
which the graph might be most appropriate, as opposed to symbolic, for
which the symbolic notation might be more suitable.) To this extent,
the Calcoolator should help to resolve some the greater issues in
middle school students’ understanding of functions.

# Technical Specifications

The Calcoolator is programmed in JavaScript, all running on the client
side (i.e. in the web browser, not on a remote server). We used the
Processing.js library for drawing the graph, and the Mathquill library
for displaying equations and numbers.

The program is designed modularly. There is one main data model that
synchronizes the state of each function across the three
representation modules (equation, table, and graph). Each function is
represented by a list of coefficients, which limits our current
implementation to polynomials. When a representation receives input
from the user that changes a function, the main data model is
notified, and it tells all of the other representations about the
change. This design allows for the easy addition of new
representations, such as simulations.

# User Testing and Improvements

We tested three classes of eleventh graders at the Winsor School in
Boston, Massachusetts. All students were female and between 15 and 17
years old. They were all enrolled in a pre-calculus course, with one
section designated honors. Students were given a laptop, connected to
the Calcoolator, and experimented with the application. We tested on
two separate occasions: once when only the graph was implemented, in
order to get preliminary feedback on the control points and
manipulation functionality, and later when most of the functionality
was in place.

During both sets of tests, students were instructed to perform a set
of tasks: graphing simple single and multiple degree polynomials,
manipulating a graph in a particular way, and adjusting the numbers in
the equations. We asked them to describe their processes as they
clicked on and manipulated the graphs, tables, and functions, and to
indicate what was intuitive and what was more difficult. We watched
them work, as well, to determine how they used the application. After
completing these tasks, the students were then free to explore the
Calcoolator and generate feedback on their experience.

In general, students were very positive about the Calcoolator,
indicating that it helped them to understand the relationships between
the functional representations in a way they had not before. However,
many advocated for more “calculator-like” features, such as tools to
find the intersection between two curves or the x-intercepts of a
function, suggesting that they would not use the Calcoolator simply to
help them visualize functions. This suggestion was a source of
conflict for us: we understand that intersections and intercepts are
an important part of algebra, but we are not sure how to represent
them in our design. If we seek to balance the three representations,
it will be easier to depict intersections on graphs and tables, but
less so with symbolic notation. While we will continue to solve this
problem, we believe that with a feature such as an intercept finder,
it will be more important to make the tool useful and usable for
students than to balance it across representations in a
counterintuitive or obscure way.

During the second test we asked them how best to orient the tables of
values. We currently have two different orientations due to space
constraints. In one version, all the tables are positioned along the
bottom, with two vertical columns, one for $x$ values, and one for
$f(x)$ values. In the other version, all the tables are stacked on top
of one another, but they consist of two rows (again, one for $x$
values, and one for the $f(x)$). Students remarked that they preferred
a mix of the two: vertical positioning of the tables, with a column
for the $x$ values, and another for the $f(x)$. They found this
position more intuitive given that $x$/$f(x)$ pairings are typically
presented in columns in their textbooks.  While this presentation will
not work due to the spacing of our present layout, we will work to
refactor our design to accommodate these stacked, vertical tables.

We also presented the design to their teachers, Byron Parrish and
Laura Cohen. As mentioned above, Ms. Cohen has taught primarily high
school math courses, though Mr. Parrish has had significant experience
teaching middle school as well. While they both agreed that the
Calcoolator is a good resource for middle school students approaching
functions for the first time, they shared some of the students’
concerns. The Calcoolator will be more useful as a classroom tool if
it helps the students “calculate” with functions (such as finding
intersection points).  Moreover, both Mr. Parrish and Ms. Cohen
recommended expanding the functionality to include trigonometric
functions so that the Calcoolator can be used in higher-level math
classes. Unlike algebraic functions, trigonometric functions exhibit
behaviors that are harder to model with the traditional “input-output”
machine, due to the complex mathematics behind trigonometric
relationships. Thus, being able to view multiple representations of
the trigonometric functions at once, as well as examine individual
values (per our table of values) would be helpful.  Nonetheless, they
believed that the Calcoolator would improve students’ understanding of
functions. In particular, they appreciated the table of values,
believing that it could facilitate a connection between the symbolic
notation and the graph, something that is often challenging for
students.

# Further Improvements

We initially aimed to implement illustrative simulations as a fourth
functional “representation.” For example, a linear simulation might
model the trajectories of two cars moving at different speeds to
separate places, and ask the user how long it would take for them to
reach their respective destinations. The user would be able to set the
relevant information (speeds, directions, distances, etc.) and then
watch two animated cars move accordingly across the screen. Similarly,
a second-degree simulation would simulate the movement of projectile
fired from the ground, allowing the user to set the starting velocity,
height, etc. (If we were to implement trigonometric functionality,
users could see how different launch angles will change the eventual
trajectory, and therefore, the behavior of the function.) We chose to
use “textbook” examples of linear and parabolic functions because they
would be familiar to students. However, they fit the philosophy of the
Calcoolator in that they offer another view of a function and its
behavior.

Unfortunately, we were not able to add this feature due to time
constraints, but we believe applications are important to building a
mathematical understanding of a concept. Simulations, specifically,
can make functions more accessible for students struggling with
abstraction in a way that the other varieties may not (Roschelle et
al., 2010). We were also reluctant to implement simulations in that
they are not particularly extensible beyond two-degree polynomials:
scenarios best modelled by higher-degree polynomials are likely to be
obscure and unfamiliar to middle-high school aged students, whereas
cars and projectiles are more familiar. Thus, while we hope to
implement these simulations eventually, we will need to decide how
best to address these challenges.

We would also like to implement “hover” functionality: when users
mouse over a particular part of the graph, for example, the
coordinates associated with that point will appear next to the mouse.
Alternatively, when hovering over a location on the table of values,
they will see that point indicated on the graph and substituted into
the equation. For instance, for $f(x) = 2x$, when hovering over $x =
4$, $f(4) = 8$ would appear in the symbolic notation section of the
Calcoolator.

Lastly, we did not have the opportunity to test younger students, and
we hope to do so in the future, especially since middle-school
students are our target audience. The eleventh graders were
nevertheless helpful, especially since they used graphing calculators
on a regular basis and could provide insight on the Calcoolator’s
design as well as its philosophy.

# Future Use

Mr. Parrish and Ms. Cohen were both enthusiastic about the Calcoolator
and are interested in bringing it into the classroom for its novel
design and philosophy. We envision the application as a
supplement––but not a replacement––to teaching and, potentially, to
existing technology.  For example, during a lecture on slope, teachers
can bring up the Calcoolator to demonstrate how changing the slope of
a line affects not only the graph but also the points. Ms. Cohen, who
frequently uses graphing software in her classroom, was pleased
because with the Calcoolator she would not have to flip between
screens to see the points generated or copy the table of values from
her calculator onto the whiteboard. Thus, the Calcoolator will free
her up to explain concepts while students can view all relevant
information simultaneously. Mr.  Parrish and his students were excited
about the Calcoolator’s ability to regenerate an equation once the
graph has been manipulated since it allows for more experimentation.
“Sometimes I know what I want a graph to look like,” one student
remarked, “But I can’t figure out what the equation should be. Or
sometimes I have the equation but I can’t visualize the graph.” She
then explained that she hopes the Calcoolator will build her intuition
about the relationship between the graphs and the symbolic
representations. Both teachers also thought it would be a helpful
standalone online resource for quick graphing and comparison. To this
extent, the Calcoolator can serve as a learning aid that will
reinforce students’ understanding. Moreover, it is online and free,
which will make it accessible to a wide variety of students and
classrooms.

On the other hand, students and teachers alike may be reluctant to use
the Calcoolator because it does not supply all the functionality of a
traditional graphing calculator. For example, when we showed the
Calcoolator to students, some were surprised that there was no keypad.
Others wanted an intercept-intersection finder, as mentioned above,
even though we were unsure of whether those features were appropriate
to the Calcoolator. We are concerned that potential users might pass
up the Calcoolator in favor of a device that places more emphasis on
one representation but has a greater range of functionality. It is
also conceivable that users will miss the point of the Calcoolator
(rather, fail to understand that it does not bias one representation
over another). To address these issues, we will need to improve our
documentation and choose our target audiences carefully.

# Conclusion

Our Calcoolator is a tool that helps students build an appreciation
for functions and the relationships between their various
representations.  It differs from other graphing calculators in that
it presents all representations simultaneously while allowing users to
explore and build their understanding. Although it is not meant to
replace classroom teaching, it can enhance it, especially if students
have trouble grasping the abstract nature of functions. We anticipate
that with several improvements, it will be useful to middle and high
school math teachers and their students; our user testing suggests
that the application will be helpful in classrooms. As curricula
develop and pressures on math classes increase, an application like
the Calcoolator can encourage creative thinking in students,
particularly for those frustrated by formulas or algorithms presented
without much explanation.

# Notes and Acknowledgements

Thank you to Michele Pistocco, Byron Parrish, and Lauren Cohen, and
the students in Class VII at the Winsor School for allowing us to
interview and test them.

Clara Kliman-Silver wrote the paper and user-tested the Calcoolator,
Jonah Kagan and Jessica Liu designed and implemented the Calcoolator,
and edited the manuscript.

## Works Consulted

Booth, Lesley R. (1988). “Children’s Difficulties in Beginning
Algebra.” In A.F.

Coxford & A.P. Shulte (Eds.), The Ideas of Algebra, K-12. 1988
Yearbook.  Reston, VA: The National Council of Teachers of
Mathematics.

Carpenter, Thomas P., Megan Loef Frank, and Linda Levi. (2003).
Thinking

Mathematically: Integrating Arithmetic and Algebra in Elementary
School.

Portsmouth, NH: Heinemann.

Gersten, Russell (chair). (2009). “Assisting Children Struggling with
Mathematics:

Response to Intervention (RtI) for Elementary and Middle-School
Students.”

Hartter, Beverley. (2009). “Function or Not? That is the Question.”
Mathematics

Teacher. 103(3), 200-205.

Rombert, Thomas A., Elizabeth Fennema, and Thomas P. Carpenter.
(1993).

Integrating Research on the Graphical Representation of Functions.
Hillsdale, New Jersey: Lawrence Erlbaum Assoociates.

Roschelle, Jeremy, Nicole Schectman, Deborah Tatar, Stephen Hegedus,
Bill

Hopkins, Susan Empson, Jennifer Knudsen, and Lawrence P Gallagher.
(2010). “Integration of Technology, Curriculum, and Professional
Development for Advancing Middle School Mathematics: Three Large-Scale
Studies.” American Education Research Journal. 47(4), 833-878.
